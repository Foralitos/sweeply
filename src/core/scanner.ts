import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import type { TargetDef } from './targets.js'

export interface FoundTarget {
  path: string
  name: string
  label: string
}

export interface FoundProject {
  /** Directorio del proyecto (el que contiene los targets) */
  path: string
  name: string
  targets: FoundTarget[]
}

/** Carpetas del home donde nunca hay proyectos del usuario */
const SKIP_DIRS = new Set([
  'Library',
  'Applications',
  'Movies',
  'Music',
  'Pictures',
  'Photos',
  'Public',
  '.Trash',
])

const MAX_DEPTH = 8

/**
 * Profundidad máxima para el modo --all: al arrancar desde raíces más altas
 * (/, volúmenes externos) hacen falta más niveles para llegar a los proyectos
 * del usuario que con el home como raíz.
 */
export const ALL_SCAN_MAX_DEPTH = 12

/**
 * Rutas absolutas del sistema que --all nunca desciende. /Volumes se incluye
 * aquí porque los volúmenes externos aprobados se agregan como raíces propias
 * (ver core/volumes.ts); así evitamos re-descubrirlos sin permiso.
 */
export const SYSTEM_DENYLIST = [
  '/System',
  '/Library',
  '/private',
  '/dev',
  '/usr',
  '/bin',
  '/sbin',
  '/opt',
  '/cores',
  '/Applications',
  '/etc',
  '/tmp',
  '/var',
  '/Volumes',
]

export interface ScanOptions {
  /** Profundidad máxima de BFS desde cada raíz. Default: MAX_DEPTH (8). */
  maxDepth?: number
  /** Rutas absolutas en las que nunca se desciende (ver SYSTEM_DENYLIST). */
  denylist?: string[]
}

/**
 * Recorre el filesystem buscando directorios-target. Emite un FoundProject
 * por cada directorio que contenga al menos un target (streaming, para que
 * la UI se llene mientras escanea). No desciende dentro de targets ni de
 * carpetas ocultas.
 *
 * Acepta una o varias raíces (el modo --all escanea desde "/" más los
 * volúmenes externos aprobados). Con varias raíces deduplica por realpath
 * por si se solapan. Ojo: realpath NO resuelve firmlinks; el caso
 * /System/Volumes/Data (espejo de /Users) lo evita la denylist, no esto.
 */
export async function* scan(
  rootDirs: string | string[],
  targets: TargetDef[],
  options: ScanOptions = {},
): AsyncGenerator<FoundProject> {
  const roots = Array.isArray(rootDirs) ? rootDirs : [rootDirs]
  const maxDepth = options.maxDepth ?? MAX_DEPTH
  const denylist = new Set(options.denylist ?? [])
  const homeDir = os.homedir()

  const byName = new Map(targets.map((t) => [t.name, t]))
  const visited = new Set<string>()
  const queue: Array<{ dir: string; depth: number }> = roots.map((root) => ({
    dir: path.resolve(root),
    depth: 0,
  }))

  while (queue.length > 0) {
    const { dir, depth } = queue.shift()!

    // dedupe por realpath solo con varias raíces: con una sola, el recorrido
    // ya no repite directorios (los symlinks se saltan) y evitamos un
    // syscall extra por carpeta
    if (roots.length > 1) {
      let real
      try {
        real = await fs.realpath(dir)
      } catch {
        continue // desapareció o sin permisos: seguimos
      }
      if (visited.has(real)) continue
      visited.add(real)
    }

    let entries
    try {
      entries = await fs.readdir(dir, { withFileTypes: true })
    } catch {
      continue // sin permisos o desapareció: seguimos
    }

    const fileNames = new Set(
      entries.filter((e) => e.isFile()).map((e) => e.name),
    )
    const found: FoundTarget[] = []
    const isHome = path.resolve(dir) === homeDir

    for (const entry of entries) {
      if (!entry.isDirectory() || entry.isSymbolicLink()) continue
      const def = byName.get(entry.name)
      if (def) {
        const ok =
          !def.requiresSibling ||
          def.requiresSibling.some((f) => fileNames.has(f))
        if (ok) {
          found.push({
            path: path.join(dir, entry.name),
            name: entry.name,
            label: def.label,
          })
          continue // nunca descender dentro de un target
        }
      }
      if (entry.name === '.git' || entry.name.startsWith('.')) continue
      const fullPath = path.join(dir, entry.name)
      if (denylist.has(fullPath)) continue
      if (isHome && SKIP_DIRS.has(entry.name)) continue
      if (depth < maxDepth) {
        queue.push({ dir: fullPath, depth: depth + 1 })
      }
    }

    if (found.length > 0) {
      yield { path: dir, name: path.basename(dir), targets: found }
    }
  }
}
