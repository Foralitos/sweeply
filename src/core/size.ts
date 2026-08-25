import fs from 'node:fs/promises'
import path from 'node:path'

/**
 * Tamaño en disco de un directorio (bytes). Usa bloques reales (como `du`)
 * cuando están disponibles, si no el tamaño lógico del archivo.
 */
export async function dirSize(dir: string): Promise<number> {
  let total = 0
  const stack = [dir]
  while (stack.length > 0) {
    const current = stack.pop()!
    let entries
    try {
      entries = await fs.readdir(current, { withFileTypes: true })
    } catch {
      continue
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name)
      if (entry.isSymbolicLink()) continue
      if (entry.isDirectory()) {
        stack.push(full)
      } else if (entry.isFile()) {
        try {
          const st = await fs.stat(full)
          total += st.blocks > 0 ? st.blocks * 512 : st.size
        } catch {
          // archivo desapareció mientras escaneábamos
        }
      }
    }
  }
  return total
}

export function formatSize(bytes: number | undefined): string {
  if (bytes === undefined) return '…'
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(0)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}
