export interface TargetDef {
  /** Nombre exacto del directorio a detectar */
  name: string
  /** Al menos uno de estos archivos debe existir junto al directorio (evita falsos positivos) */
  requiresSibling?: string[]
  /** Ecosistema al que pertenece, para mostrar en la UI */
  label: string
}

export const DEFAULT_TARGETS: TargetDef[] = [
  { name: 'node_modules', requiresSibling: ['package.json'], label: 'node' },
  { name: '.next', requiresSibling: ['package.json'], label: 'next' },
  { name: '.nuxt', requiresSibling: ['package.json'], label: 'nuxt' },
  { name: '.turbo', requiresSibling: ['package.json'], label: 'turbo' },
  { name: 'dist', requiresSibling: ['package.json'], label: 'build' },
  { name: 'build', requiresSibling: ['package.json'], label: 'build' },
  { name: 'out', requiresSibling: ['package.json'], label: 'build' },
  { name: 'venv', requiresSibling: ['pyproject.toml', 'requirements.txt', 'setup.py'], label: 'python' },
  { name: '.venv', requiresSibling: ['pyproject.toml', 'requirements.txt', 'setup.py'], label: 'python' },
  { name: 'target', requiresSibling: ['Cargo.toml'], label: 'rust' },
  { name: 'Pods', requiresSibling: ['Podfile'], label: 'ios' },
]

/** Archivos que marcan "aquí vive un proyecto" */
export const MANIFESTS = [
  'package.json',
  'pyproject.toml',
  'requirements.txt',
  'setup.py',
  'Cargo.toml',
  'Podfile',
  'go.mod',
]

export function buildTargets(extra: string[]): TargetDef[] {
  const custom = extra
    .filter((n) => n.trim().length > 0)
    .map((n) => ({ name: n.trim(), label: 'custom' }))
  return [...DEFAULT_TARGETS, ...custom]
}
