import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import fs from 'node:fs/promises'

const run = promisify(execFile)

export type Semaphore = 'green' | 'yellow' | 'red'

export interface GitStatus {
  semaphore: Semaphore
  /** Resumen corto para la fila: "pusheado", "3 sin commit", "2 sin push", "sin remoto", "sin git" */
  summary: string
  /** Detalle multilínea para el panel g */
  detail: string
  /** Última actividad (fecha del último commit, o mtime del dir si no hay git) */
  lastActivity: string
}

async function git(cwd: string, args: string[]): Promise<string> {
  const { stdout } = await run('git', args, { cwd, timeout: 10_000 })
  return stdout.trim()
}

export async function gitStatus(projectDir: string): Promise<GitStatus> {
  let lastActivity = ''
  try {
    const st = await fs.stat(projectDir)
    lastActivity = st.mtime.toISOString().slice(0, 10)
  } catch {
    // nada, se queda vacío
  }

  try {
    await git(projectDir, ['rev-parse', '--is-inside-work-tree'])
  } catch {
    return {
      semaphore: 'red',
      summary: 'sin git',
      detail: 'Este directorio no es un repositorio git.\nSi borras el proyecto completo no hay forma de recuperarlo.',
      lastActivity,
    }
  }

  try {
    lastActivity = (await git(projectDir, ['log', '-1', '--format=%cs'])) || lastActivity
  } catch {
    // repo sin commits; usamos mtime
  }

  let branch = ''
  try {
    branch = await git(projectDir, ['branch', '--show-current'])
  } catch {
    // detached u otro estado raro
  }

  let dirtyLines: string[] = []
  try {
    const porcelain = await git(projectDir, ['status', '--porcelain'])
    dirtyLines = porcelain ? porcelain.split('\n') : []
  } catch {
    // si status falla lo tratamos como sucio por precaución
    dirtyLines = ['(git status falló)']
  }

  let ahead: number | null = null
  let hasUpstream = true
  try {
    ahead = parseInt(await git(projectDir, ['rev-list', '@{u}..HEAD', '--count']), 10)
  } catch {
    hasUpstream = false
  }

  const detailParts = [`rama: ${branch || '(detached)'}`]
  if (dirtyLines.length > 0) {
    detailParts.push(
      `${dirtyLines.length} archivo(s) sin commitear:`,
      ...dirtyLines.slice(0, 8).map((l) => `  ${l}`),
    )
    if (dirtyLines.length > 8) detailParts.push(`  … y ${dirtyLines.length - 8} más`)
  }
  if (!hasUpstream) detailParts.push('sin rama remota configurada (no hay respaldo en un servidor)')
  else if (ahead && ahead > 0) detailParts.push(`${ahead} commit(s) sin pushear`)

  if (dirtyLines.length > 0) {
    return {
      semaphore: 'yellow',
      summary: `${dirtyLines.length} sin commit`,
      detail: detailParts.join('\n'),
      lastActivity,
    }
  }
  if (!hasUpstream) {
    return { semaphore: 'yellow', summary: 'sin remoto', detail: detailParts.join('\n'), lastActivity }
  }
  if (ahead && ahead > 0) {
    return { semaphore: 'yellow', summary: `${ahead} sin push`, detail: detailParts.join('\n'), lastActivity }
  }
  return {
    semaphore: 'green',
    summary: 'pusheado',
    detail: detailParts.concat('Todo commiteado y pusheado. Borrar aquí es 100% recuperable.').join('\n'),
    lastActivity,
  }
}
