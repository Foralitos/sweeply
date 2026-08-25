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
 * Recorre el filesystem buscando directorios-target. Emite un FoundProject
 * por cada directorio que contenga al menos un target (streaming, para que
 * la UI se llene mientras escanea). No desciende dentro de targets ni de
 * carpetas ocultas.
 */
export async function* scan(
  rootDir: string,
  targets: TargetDef[],
): AsyncGenerator<FoundProject> {
  const byName = new Map(targets.map((t) => [t.name, t]))
  const isHome = path.resolve(rootDir) === os.homedir()
  const queue: Array<{ dir: string; depth: number }> = [
    { dir: path.resolve(rootDir), depth: 0 },
  ]

  while (queue.length > 0) {
    const { dir, depth } = queue.shift()!
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
      if (depth === 0 && isHome && SKIP_DIRS.has(entry.name)) continue
      if (depth < MAX_DEPTH) {
        queue.push({ dir: path.join(dir, entry.name), depth: depth + 1 })
      }
    }

    if (found.length > 0) {
      yield { path: dir, name: path.basename(dir), targets: found }
    }
  }
}
