import React from 'react'
import { render } from 'ink'
import os from 'node:os'
import { App } from './ui/App.js'
import { buildTargets } from './core/targets.js'
import { detectLang, setLang, t } from './core/i18n.js'

function parseArgs(argv: string[]) {
  let dir = os.homedir()
  let extraTargets: string[] = []
  let lang: string | undefined
  let help = false
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!
    if (arg === '--dir' || arg === '-d') dir = argv[++i] ?? dir
    else if (arg === '--targets' || arg === '-t') extraTargets = (argv[++i] ?? '').split(',')
    else if (arg === '--lang' || arg === '-l') lang = argv[++i]
    else if (arg === '--help' || arg === '-h') help = true
  }
  return { dir, extraTargets, lang, help }
}

const { dir, extraTargets, lang, help } = parseArgs(process.argv.slice(2))

// el idioma se fija antes de cualquier salida, incluida la ayuda
setLang(detectLang(lang))

if (help) {
  console.log(t().help)
  process.exit(0)
}

render(<App rootDir={dir} targets={buildTargets(extraTargets)} />)
