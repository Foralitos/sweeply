import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'

const PKG_NAME = 'sweeply'
const REGISTRY = 'https://registry.npmjs.org'
const CHECK_EVERY_MS = 24 * 60 * 60 * 1000
const FETCH_TIMEOUT_MS = 2000

export interface UpdateInfo {
  current: string
  latest: string
  /** comando exacto a sugerir, según cómo se instaló el binario */
  command: string
}

/**
 * Sube directorios desde este módulo hasta topar con un package.json.
 * En dev (tsx) el módulo vive en src/core/, en prod tsup lo colapsa en
 * dist/cli.js — la profundidad cambia, así que no se puede hardcodear.
 */
async function readOwnVersion(): Promise<string | null> {
  let dir = path.dirname(fileURLToPath(import.meta.url))
  for (let i = 0; i < 5; i++) {
    try {
      const raw = await fs.readFile(path.join(dir, 'package.json'), 'utf8')
      const parsed = JSON.parse(raw) as { name?: string; version?: string }
      if (parsed.name === PKG_NAME && parsed.version) return parsed.version
    } catch {
      // sigue subiendo
    }
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return null
}

/** compara "0.2.0" vs "0.10.1" numéricamente, ignorando prereleases */
function isNewer(latest: string, current: string): boolean {
  const nums = (v: string) =>
    v.split('-')[0]!.split('.').map((n) => Number.parseInt(n, 10) || 0)
  const a = nums(latest)
  const b = nums(current)
  for (let i = 0; i < 3; i++) {
    const x = a[i] ?? 0
    const y = b[i] ?? 0
    if (x !== y) return x > y
  }
  return false
}

/**
 * Deduce el comando de actualización de la ruta del propio binario.
 * Es el mismo truco que usa claude-code para decirte "brew upgrade"
 * en vez de "npm i -g" cuando lo instalaste con Homebrew.
 */
function upgradeCommand(): string {
  const self = process.argv[1] ?? fileURLToPath(import.meta.url)
  if (self.includes('/Caskroom/') || self.includes('/Cellar/')) {
    return `brew upgrade ${PKG_NAME}`
  }
  if (self.includes('/_npx/')) return `npx ${PKG_NAME}@latest`
  if (self.includes('/.bun/')) return `bun add -g ${PKG_NAME}@latest`
  if (self.includes('/yarn/global/')) return `yarn global upgrade ${PKG_NAME}`
  return `npm i -g ${PKG_NAME}@latest`
}

function cacheFile(): string {
  const base =
    process.env.XDG_CACHE_HOME || path.join(os.homedir(), '.cache')
  return path.join(base, PKG_NAME, 'update-check.json')
}

async function readCache(): Promise<{ at: number; latest: string } | null> {
  try {
    const raw = await fs.readFile(cacheFile(), 'utf8')
    const parsed = JSON.parse(raw) as { at?: number; latest?: string }
    if (typeof parsed.at === 'number' && typeof parsed.latest === 'string') {
      return { at: parsed.at, latest: parsed.latest }
    }
  } catch {
    // sin cache todavía
  }
  return null
}

async function writeCache(latest: string): Promise<void> {
  const file = cacheFile()
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, JSON.stringify({ at: Date.now(), latest }), 'utf8')
}

async function fetchLatest(): Promise<string | null> {
  const res = await fetch(`${REGISTRY}/${PKG_NAME}/latest`, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { accept: 'application/json' },
  })
  if (!res.ok) return null
  const body = (await res.json()) as { version?: string }
  return body.version ?? null
}

/**
 * Devuelve info de actualización o null. Nunca lanza: si no hay red, si el
 * registry se cae o si el JSON viene raro, la respuesta es "no hay update".
 * Un CLI que no arranca por no poder checar versiones es un CLI roto.
 */
export async function checkForUpdate(): Promise<UpdateInfo | null> {
  try {
    // convenciones que la gente ya espera: no molestar en CI ni si lo apagaron
    if (process.env.NO_UPDATE_NOTIFIER || process.env.CI) return null

    const current = await readOwnVersion()
    if (!current) return null

    const cached = await readCache()
    let latest: string | null = null

    if (cached && Date.now() - cached.at < CHECK_EVERY_MS) {
      // dentro de la ventana: reusa lo cacheado, no le pegues al registry
      latest = cached.latest
    } else {
      latest = await fetchLatest()
      if (latest) void writeCache(latest).catch(() => {})
    }

    if (!latest || !isNewer(latest, current)) return null
    return { current, latest, command: upgradeCommand() }
  } catch {
    return null
  }
}
