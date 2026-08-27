# sweeply

[![CI](https://github.com/Foralitos/sweeply/actions/workflows/ci.yml/badge.svg)](https://github.com/Foralitos/sweeply/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/sweeply.svg)](https://www.npmjs.com/package/sweeply)
[![license](https://img.shields.io/npm/l/sweeply.svg)](LICENSE)

TUI para encontrar y borrar el peso muerto de tus proyectos — `node_modules`, `.next`, `dist`, `venv`, `target` y demás carpetas regenerables — con un **semáforo de seguridad git** que te dice de un vistazo qué tan tranquilo puedes estar:

- 🟢 **pusheado** — todo commiteado y en el remoto. Borrar aquí es 100% recuperable.
- 🟡 **cambios sin commitear / sin push / sin remoto** — revisa antes de tocar el proyecto.
- 🔴 **sin git** — si borras el proyecto completo, no hay vuelta atrás.

sweeply **solo borra carpetas regenerables** (las recuperas con `yarn install`, `pip install`, etc.), nunca tu código. Y siempre pide confirmación.

## Uso

Requiere **Node 22 o superior**.

```bash
npx sweeply                 # escanea tu home
npx sweeply --dir ~/Sites   # escanea una carpeta específica
npx sweeply -t .cache,tmp   # detecta carpetas extra
```

### Teclas

| Tecla | Acción |
|---|---|
| `↑↓` / `j k` | navegar |
| `espacio` | seleccionar/deseleccionar |
| `a` | seleccionar todos los 🟢 |
| `enter` | borrar seleccionados (pide confirmación) |
| `g` | detalle git del proyecto |
| `s` | ordenar por tamaño |
| `q` | salir |

## Qué detecta

`node_modules`, `.next`, `.nuxt`, `.turbo`, `dist`, `build`, `out` (si hay `package.json` al lado), `venv`/`.venv` (si hay proyecto Python al lado), `target` (Rust), `Pods` (iOS). La condición de "manifest al lado" evita falsos positivos: una carpeta `dist` suelta sin `package.json` no se toca.

## Desarrollo

```bash
yarn           # instalar deps
yarn dev       # correr desde src con tsx
yarn build     # compilar a dist/ con tsup
yarn typecheck
```

## ¿Por qué no npkill?

[npkill](https://npkill.js.org) está muy bien y fue la inspiración. sweeply agrega dos cosas: detección multi-ecosistema (Python, Rust, iOS, builds de Next) y el semáforo git — la respuesta a "¿será seguro borrar esto?" sin tener que abrir el proyecto.

## Contribuir

Los PRs son bienvenidos — lee [CONTRIBUTING.md](CONTRIBUTING.md) primero.
Para vulnerabilidades, usa el [canal privado](SECURITY.md), no un issue público.

## Licencia

MIT — ver [LICENSE](LICENSE).
