# sweeply

[![CI](https://github.com/Foralitos/sweeply/actions/workflows/ci.yml/badge.svg)](https://github.com/Foralitos/sweeply/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/sweeply.svg)](https://www.npmjs.com/package/sweeply)
[![license](https://img.shields.io/npm/l/sweeply.svg)](https://github.com/Foralitos/sweeply/blob/main/LICENSE)

**English** · [Español](https://github.com/Foralitos/sweeply#español)

A TUI to find and delete the dead weight in your projects — `node_modules`, `.next`, `dist`, `venv`, `target` and every other regenerable folder — with a **git safety traffic light** that tells you at a glance how relaxed you can be:

- 🟢 **pushed** — everything committed and on the remote. Deleting here is 100% recoverable.
- 🟡 **uncommitted changes / unpushed / no remote** — check before touching the project.
- 🔴 **no git** — if you delete the whole project, there is no way back.

sweeply **only deletes regenerable folders** (you get them back with `yarn install`, `pip install`, etc.), never your code. And it always asks for confirmation.

## Usage

Requires **Node 22 or newer**.

```bash
npx sweeply                 # scan your home
npx sweeply --dir ~/Sites   # scan a specific folder
npx sweeply -t .cache,tmp   # detect extra folders
npx sweeply --lang es       # force the interface language
```

The interface follows your system locale (`LANG` / `LC_ALL`): Spanish if it starts with `es`, English otherwise. `--lang en|es` overrides it.

### Keys

| Key | Action |
|---|---|
| `↑↓` / `j k` | move |
| `space` | select / deselect |
| `a` | select every 🟢 |
| `enter` | delete selected (asks for confirmation) |
| `g` | git detail for the project |
| `s` | sort by size |
| `q` | quit |

## What it detects

`node_modules`, `.next`, `.nuxt`, `.turbo`, `dist`, `build`, `out` (when there is a `package.json` next to them), `venv`/`.venv` (when there is a Python project next to them), `target` (Rust), `Pods` (iOS). The "manifest next to it" condition avoids false positives: a lone `dist` folder with no `package.json` is left alone.

## Development

```bash
yarn           # install deps
yarn dev       # run from src with tsx
yarn build     # compile to dist/ with tsup
yarn typecheck
```

## Why not npkill?

[npkill](https://npkill.js.org) is great and was the inspiration. sweeply adds two things: multi-ecosystem detection (Python, Rust, iOS, Next builds) and the git traffic light — the answer to "is it safe to delete this?" without having to open the project.

## Contributing

PRs are welcome — read [CONTRIBUTING.md](https://github.com/Foralitos/sweeply/blob/main/CONTRIBUTING.md) first.
For vulnerabilities, use the [private channel](https://github.com/Foralitos/sweeply/blob/main/SECURITY.md), not a public issue.

## License

MIT — see [LICENSE](https://github.com/Foralitos/sweeply/blob/main/LICENSE).

---

## Español

[English](https://github.com/Foralitos/sweeply#sweeply) · **Español**

TUI para encontrar y borrar el peso muerto de tus proyectos — `node_modules`, `.next`, `dist`, `venv`, `target` y demás carpetas regenerables — con un **semáforo de seguridad git** que te dice de un vistazo qué tan tranquilo puedes estar:

- 🟢 **pusheado** — todo commiteado y en el remoto. Borrar aquí es 100% recuperable.
- 🟡 **cambios sin commitear / sin push / sin remoto** — revisa antes de tocar el proyecto.
- 🔴 **sin git** — si borras el proyecto completo, no hay vuelta atrás.

sweeply **solo borra carpetas regenerables** (las recuperas con `yarn install`, `pip install`, etc.), nunca tu código. Y siempre pide confirmación.

### Uso

Requiere **Node 22 o superior**.

```bash
npx sweeply                 # escanea tu home
npx sweeply --dir ~/Sites   # escanea una carpeta específica
npx sweeply -t .cache,tmp   # detecta carpetas extra
npx sweeply --lang en       # fuerza el idioma de la interfaz
```

La interfaz sigue el locale de tu sistema (`LANG` / `LC_ALL`): español si empieza con `es`, inglés en cualquier otro caso. `--lang en|es` lo fuerza.

#### Teclas

| Tecla | Acción |
|---|---|
| `↑↓` / `j k` | navegar |
| `espacio` | seleccionar/deseleccionar |
| `a` | seleccionar todos los 🟢 |
| `enter` | borrar seleccionados (pide confirmación) |
| `g` | detalle git del proyecto |
| `s` | ordenar por tamaño |
| `q` | salir |

### Qué detecta

`node_modules`, `.next`, `.nuxt`, `.turbo`, `dist`, `build`, `out` (si hay `package.json` al lado), `venv`/`.venv` (si hay proyecto Python al lado), `target` (Rust), `Pods` (iOS). La condición de "manifest al lado" evita falsos positivos: una carpeta `dist` suelta sin `package.json` no se toca.

### Desarrollo

```bash
yarn           # instalar deps
yarn dev       # correr desde src con tsx
yarn build     # compilar a dist/ con tsup
yarn typecheck
```

### ¿Por qué no npkill?

[npkill](https://npkill.js.org) está muy bien y fue la inspiración. sweeply agrega dos cosas: detección multi-ecosistema (Python, Rust, iOS, builds de Next) y el semáforo git — la respuesta a "¿será seguro borrar esto?" sin tener que abrir el proyecto.

### Contribuir

Los PRs son bienvenidos — lee [CONTRIBUTING.md](https://github.com/Foralitos/sweeply/blob/main/CONTRIBUTING.md) primero.
Para vulnerabilidades, usa el [canal privado](https://github.com/Foralitos/sweeply/blob/main/SECURITY.md), no un issue público.

### Licencia

MIT — ver [LICENSE](https://github.com/Foralitos/sweeply/blob/main/LICENSE).
