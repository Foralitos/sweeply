/**
 * i18n del TUI. El idioma se fija una sola vez al arrancar (un CLI no cambia
 * de idioma a media sesión), así que se guarda en un singleton de módulo en
 * vez de arrastrar un parámetro `lang` por toda la app y por core/git.
 */

export type Lang = 'en' | 'es'

/**
 * Prioridad: --lang explícito > locale del sistema > inglés.
 * LC_ALL pisa a LC_MESSAGES y ese pisa a LANG, que es el orden que define POSIX.
 */
export function detectLang(explicit?: string): Lang {
  if (explicit) {
    const v = explicit.toLowerCase()
    if (v.startsWith('es')) return 'es'
    if (v.startsWith('en')) return 'en'
  }
  const env = process.env.LC_ALL || process.env.LC_MESSAGES || process.env.LANG || ''
  return env.toLowerCase().startsWith('es') ? 'es' : 'en'
}

export interface Strings {
  help: string
  scanning: string
  projects: (n: number) => string
  reclaimable: string
  nothingToClean: (dir: string) => string
  confirmTitle: (n: number, size: string) => string
  andMore: (n: number) => string
  onlyRegenerable: string
  confirmKeys: string
  deleting: string
  errorIn: (name: string, err: string) => string
  freedThisSession: (size: string) => string
  keysMain: string
  marked: (n: number, size: string) => string
  keysTail: string
  sortSuffix: string
  keysQuit: string
  freedCell: string
  updateAvailable: (current: string, latest: string) => string
  git: {
    pushed: string
    noGit: string
    noGitDetail: string
    uncommitted: (n: number) => string
    noRemote: string
    unpushed: (n: number) => string
    branch: (b: string) => string
    detached: string
    filesUncommitted: (n: number) => string
    andMore: (n: number) => string
    noUpstreamDetail: string
    unpushedDetail: (n: number) => string
    allGoodDetail: string
    statusFailed: string
  }
}

const en: Strings = {
  help: `sweeply — sweep the dead weight out of your projects

Usage: sweeply [options]

  -d, --dir <path>       where to look (default: your home)
  -t, --targets <a,b>    extra folders to detect, comma separated
  -l, --lang <en|es>     interface language (default: your system locale)
  -h, --help             this help

Inside the UI: ↑↓ move · space select · a select every 🟢 · enter delete
(asks for confirmation) · g git detail · s sort by size · q quit`,
  scanning: 'scanning…',
  projects: (n) => `${n} project${n === 1 ? '' : 's'}`,
  reclaimable: 'reclaimable',
  nothingToClean: (dir) => `Nothing to clean up in ${dir}.`,
  confirmTitle: (n, size) => `Delete ${n} project${n === 1 ? '' : 's'} — ${size}?`,
  andMore: (n) => `  … and ${n} more`,
  onlyRegenerable: 'Only regenerable folders are deleted, never your code.',
  confirmKeys: 'y = yes, delete · n = cancel',
  deleting: 'deleting…',
  errorIn: (name, err) => `error on ${name}: ${err}`,
  freedThisSession: (size) => `✔ freed this session: ${size}`,
  keysMain: '↑↓ move · space select · a select 🟢 · enter delete',
  marked: (n, size) => `✗ ${n} marked = ${size}`,
  keysTail: ' · g git detail · s sort',
  sortSuffix: ' (size)',
  keysQuit: ' · q quit',
  freedCell: 'freed',
  updateAvailable: (current, latest) => `A new version is available (${current} → ${latest}). Run: `,
  git: {
    pushed: 'pushed',
    noGit: 'no git',
    noGitDetail:
      'This directory is not a git repository.\nIf you delete the whole project there is no way to get it back.',
    uncommitted: (n) => `${n} uncommitted`,
    noRemote: 'no remote',
    unpushed: (n) => `${n} unpushed`,
    branch: (b) => `branch: ${b}`,
    detached: '(detached)',
    filesUncommitted: (n) => `${n} uncommitted file(s):`,
    andMore: (n) => `  … and ${n} more`,
    noUpstreamDetail: 'no remote branch configured (there is no backup on a server)',
    unpushedDetail: (n) => `${n} unpushed commit(s)`,
    allGoodDetail: 'Everything is committed and pushed. Deleting here is 100% recoverable.',
    statusFailed: '(git status failed)',
  },
}

const es: Strings = {
  help: `sweeply — limpia el peso muerto de tus proyectos

Uso: sweeply [opciones]

  -d, --dir <ruta>       dónde buscar (default: tu home)
  -t, --targets <a,b>    carpetas extra a detectar, separadas por coma
  -l, --lang <en|es>     idioma de la interfaz (default: el de tu sistema)
  -h, --help             esta ayuda

Dentro de la interfaz: ↑↓ navegar · espacio seleccionar · a seleccionar
todo lo 🟢 · enter borrar (pide confirmación) · g detalle git · s ordenar
por tamaño · q salir`,
  scanning: 'escaneando…',
  projects: (n) => `${n} proyecto${n === 1 ? '' : 's'}`,
  reclaimable: 'recuperables',
  nothingToClean: (dir) => `No encontré nada que limpiar en ${dir}.`,
  confirmTitle: (n, size) => `¿Borrar ${n} proyecto${n === 1 ? '' : 's'} — ${size}?`,
  andMore: (n) => `  … y ${n} más`,
  onlyRegenerable: 'Solo se borran las carpetas regenerables, nunca tu código.',
  confirmKeys: 'y = sí, borrar · n = cancelar',
  deleting: 'borrando…',
  errorIn: (name, err) => `error en ${name}: ${err}`,
  freedThisSession: (size) => `✔ liberado en esta sesión: ${size}`,
  keysMain: '↑↓ navegar · espacio seleccionar · a seleccionar 🟢 · enter borrar',
  marked: (n, size) => `✗ ${n} marcados = ${size}`,
  keysTail: ' · g detalle git · s orden',
  sortSuffix: ' (tamaño)',
  keysQuit: ' · q salir',
  freedCell: 'liberado',
  updateAvailable: (current, latest) => `Hay una versión nueva (${current} → ${latest}). Corre: `,
  git: {
    pushed: 'pusheado',
    noGit: 'sin git',
    noGitDetail:
      'Este directorio no es un repositorio git.\nSi borras el proyecto completo no hay forma de recuperarlo.',
    uncommitted: (n) => `${n} sin commit`,
    noRemote: 'sin remoto',
    unpushed: (n) => `${n} sin push`,
    branch: (b) => `rama: ${b}`,
    detached: '(detached)',
    filesUncommitted: (n) => `${n} archivo(s) sin commitear:`,
    andMore: (n) => `  … y ${n} más`,
    noUpstreamDetail: 'sin rama remota configurada (no hay respaldo en un servidor)',
    unpushedDetail: (n) => `${n} commit(s) sin pushear`,
    allGoodDetail: 'Todo commiteado y pusheado. Borrar aquí es 100% recuperable.',
    statusFailed: '(git status falló)',
  },
}

const STRINGS: Record<Lang, Strings> = { en, es }

let active: Lang = 'en'

export function setLang(lang: Lang): void {
  active = lang
}

export function t(): Strings {
  return STRINGS[active]
}
