import fs from 'node:fs/promises'
import type { FoundTarget } from './scanner.js'

/**
 * Borra los targets dados, uno por uno, reportando progreso.
 * Solo recibe rutas que el scanner clasificó como target regenerable —
 * nunca el directorio del proyecto.
 */
export async function removeTargets(
  targets: FoundTarget[],
  onProgress: (done: number, total: number, current: string) => void,
): Promise<{ removed: string[]; failed: Array<{ path: string; error: string }> }> {
  const removed: string[] = []
  const failed: Array<{ path: string; error: string }> = []
  let done = 0
  for (const t of targets) {
    onProgress(done, targets.length, t.path)
    try {
      await fs.rm(t.path, { recursive: true, force: true })
      removed.push(t.path)
    } catch (err) {
      failed.push({ path: t.path, error: err instanceof Error ? err.message : String(err) })
    }
    done += 1
    onProgress(done, targets.length, t.path)
  }
  return { removed, failed }
}
