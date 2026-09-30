import fs from 'node:fs/promises'
import path from 'node:path'

const VOLUMES_DIR = '/Volumes'

export interface VolumeCandidate {
  /** Ruta absoluta bajo /Volumes, p. ej. /Volumes/Backup */
  path: string
  /** Nombre del volumen tal como aparece en /Volumes */
  name: string
}

/**
 * Lista los volúmenes externos montados en /Volumes candidatos a escanear
 * en modo --all. Descarta symlinks (el volumen de arranque, p. ej.
 * "Macintosh HD", macOS lo expone como symlink a "/"), cualquier entrada
 * cuyo realpath termine siendo "/" y las que viven en el mismo device que
 * "/" (el volumen de datos del disco de arranque).
 */
export async function listVolumeCandidates(): Promise<VolumeCandidate[]> {
  let entries
  try {
    entries = await fs.readdir(VOLUMES_DIR, { withFileTypes: true })
  } catch {
    return []
  }

  // el volumen de datos del disco de arranque ("Macintosh HD - Data") puede
  // aparecer como directorio real; comparte device con "/" por los firmlinks
  let rootDev: number | undefined
  try {
    rootDev = (await fs.stat('/')).dev
  } catch {
    // sin stat de "/" seguimos solo con el filtro por realpath
  }

  const candidates: VolumeCandidate[] = []
  for (const entry of entries) {
    if (entry.isSymbolicLink() || !entry.isDirectory()) continue
    const full = path.join(VOLUMES_DIR, entry.name)
    try {
      const real = await fs.realpath(full)
      if (real === '/') continue
      if (rootDev !== undefined && (await fs.stat(full)).dev === rootDev) continue
      candidates.push({ path: full, name: entry.name })
    } catch {
      continue // desapareció o sin permisos: lo salteamos
    }
  }
  return candidates
}
