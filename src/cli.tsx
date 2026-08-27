import React from 'react'
import { render } from 'ink'
import os from 'node:os'
import { App } from './ui/App.js'
import { buildTargets } from './core/targets.js'

function parseArgs(argv: string[]) {
  let dir = os.homedir()
  let extraTargets: string[] = []
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!
    if (arg === '--dir' || arg === '-d') dir = argv[++i] ?? dir
    else if (arg === '--targets' || arg === '-t') extraTargets = (argv[++i] ?? '').split(',')
    else if (arg === '--help' || arg === '-h') {
      console.log(`sweeply — limpia el peso muerto de tus proyectos

Uso: sweeply [opciones]

  -d, --dir <ruta>       dónde buscar (default: tu home)
  -t, --targets <a,b>    carpetas extra a detectar, separadas por coma
  -h, --help             esta ayuda

Dentro de la interfaz: ↑↓ navegar · espacio seleccionar · a seleccionar
todo lo 🟢 · enter borrar (pide confirmación) · g detalle git · s ordenar
por tamaño · q salir`)
      process.exit(0)
    }
  }
  return { dir, extraTargets }
}

const { dir, extraTargets } = parseArgs(process.argv.slice(2))
render(<App rootDir={dir} targets={buildTargets(extraTargets)} />)
