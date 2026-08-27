# Contributing to sweeply

**English** · [Español](#contribuir-a-sweeply)

Thanks for stopping by. Before writing code, open an issue to agree on the
approach — that way nobody sinks work into something that will not land.

## Setup

You need **Node 22 or newer** and yarn.

```bash
yarn                 # install deps
yarn dev             # run from src with tsx
yarn build           # compile to dist/ with tsup
yarn typecheck       # tsc --noEmit
```

## Workflow

`main` is protected: everything lands through a pull request with green CI and
a review.

1. Fork and branch off `main`.
2. Lowercase commits prefixed by area: `core:`, `ui:`, `docs:`, `fix:`.
3. Run `yarn typecheck && yarn build` before opening the PR.
4. Describe **how you tested it**. sweeply deletes files: a PR touching
   `src/core/remove.ts` or `src/core/targets.ts` without evidence of testing
   does not get merged.

## Testing deletion changes without risking your disk

Build throwaway fixtures and point sweeply at them, never at your home:

```bash
mkdir -p /tmp/sweeply-fixtures/project/node_modules
cd /tmp/sweeply-fixtures/project && npm init -y && git init
yarn --cwd ~/Backend/sweeply dev -- --dir /tmp/sweeply-fixtures
```

Cover the three traffic-light states (pushed / dirty / no git) and the false
positive of a lone `dist` with no `package.json`.

## Adding or changing strings

The UI is bilingual. Every user-facing string lives in `src/core/i18n.ts`, in
both the `en` and the `es` object — including the git traffic-light summaries,
which are produced in `src/core/git.ts`, not in the components. A PR that
hardcodes a string inside a component will be asked to move it.

## What is in scope and what is not

**Yes:** new target ecosystems, scanner performance, TUI fixes, better manifest
detection, translation fixes.

**No:** a `--yes` flag or any unattended deletion mode. The confirmation is the
project's safety guarantee, not an annoyance.

## Security

Vulnerabilities go through the private channel, not a public issue. See
[SECURITY.md](SECURITY.md).

---

# Contribuir a sweeply

[English](#contributing-to-sweeply) · **Español**

Gracias por pasar. Antes de escribir código, abre un issue para acordar el
enfoque — así nadie invierte trabajo en algo que no va a entrar.

## Instalación

Necesitas **Node 22 o superior** y yarn.

```bash
yarn                 # instalar deps
yarn dev             # correr desde src con tsx
yarn build           # compilar a dist/ con tsup
yarn typecheck       # tsc --noEmit
```

## Flujo de trabajo

`main` está protegida: todo entra por pull request con CI en verde y revisión.

1. Haz fork y ramifica desde `main`.
2. Commits en minúsculas con prefijo de área: `core:`, `ui:`, `docs:`, `fix:`.
3. `yarn typecheck && yarn build` antes de abrir el PR.
4. Describe **cómo lo probaste**. sweeply borra archivos: un PR que toque
   `src/core/remove.ts` o `src/core/targets.ts` sin evidencia de prueba no se
   mergea.

## Probar cambios de borrado sin arriesgar tu disco

Arma fixtures desechables y apunta sweeply ahí, nunca a tu home:

```bash
mkdir -p /tmp/sweeply-fixtures/proyecto/node_modules
cd /tmp/sweeply-fixtures/proyecto && npm init -y && git init
yarn --cwd ~/Backend/sweeply dev -- --dir /tmp/sweeply-fixtures
```

Cubre los tres semáforos (pusheado / sucio / sin git) y el falso positivo del
`dist` suelto sin `package.json`.

## Agregar o cambiar textos

La interfaz es bilingüe. Todo string que ve el usuario vive en
`src/core/i18n.ts`, en los dos objetos (`en` y `es`) — incluidos los resúmenes
del semáforo git, que se arman en `src/core/git.ts`, no en los componentes. A un
PR que hardcodee un string dentro de un componente se le va a pedir moverlo.

## Qué sí y qué no

**Sí:** nuevos ecosistemas de targets, mejoras de rendimiento del scanner,
arreglos de la TUI, mejor detección de manifests, correcciones de traducción.

**No:** un flag `--yes` o cualquier modo de borrado desatendido. La
confirmación es la garantía de seguridad del proyecto, no un estorbo.

## Seguridad

Vulnerabilidades por el canal privado, no por issue público. Ver
[SECURITY.md](SECURITY.md).
