import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import fs from 'node:fs/promises'
import { t } from './i18n.js'

const run = promisify(execFile)

export type Semaphore = 'green' | 'yellow' | 'red'

export interface GitStatus {
  semaphore: Semaphore
  /** Resumen corto para la fila, ya traducido: "pushed", "3 uncommitted", "no git"… */
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
      summary: t().git.noGit,
      detail: t().git.noGitDetail,
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
    dirtyLines = [t().git.statusFailed]
  }

  let ahead: number | null = null
  let hasUpstream = true
  try {
    ahead = parseInt(await git(projectDir, ['rev-list', '@{u}..HEAD', '--count']), 10)
  } catch {
    hasUpstream = false
  }

  const detailParts = [t().git.branch(branch || t().git.detached)]
  if (dirtyLines.length > 0) {
    detailParts.push(
      t().git.filesUncommitted(dirtyLines.length),
      ...dirtyLines.slice(0, 8).map((l) => `  ${l}`),
    )
    if (dirtyLines.length > 8) detailParts.push(t().git.andMore(dirtyLines.length - 8))
  }
  if (!hasUpstream) detailParts.push(t().git.noUpstreamDetail)
  else if (ahead && ahead > 0) detailParts.push(t().git.unpushedDetail(ahead))

  if (dirtyLines.length > 0) {
    return {
      semaphore: 'yellow',
      summary: t().git.uncommitted(dirtyLines.length),
      detail: detailParts.join('\n'),
      lastActivity,
    }
  }
  if (!hasUpstream) {
    return { semaphore: 'yellow', summary: t().git.noRemote, detail: detailParts.join('\n'), lastActivity }
  }
  if (ahead && ahead > 0) {
    return { semaphore: 'yellow', summary: t().git.unpushed(ahead), detail: detailParts.join('\n'), lastActivity }
  }
  return {
    semaphore: 'green',
    summary: t().git.pushed,
    detail: detailParts.concat(t().git.allGoodDetail).join('\n'),
    lastActivity,
  }
}
