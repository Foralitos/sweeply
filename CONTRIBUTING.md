# Contribuir a sweeply

Gracias por pasar. Antes de escribir código, abre un issue para acordar el
enfoque — así nadie invierte trabajo en algo que no va a entrar.

## Setup

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

## Qué sí y qué no

**Sí:** nuevos ecosistemas de targets, mejoras de rendimiento del scanner,
arreglos de la TUI, mejor detección de manifests.

**No:** un flag `--yes` o cualquier modo de borrado desatendido. La
confirmación es la garantía de seguridad del proyecto, no un estorbo.

## Seguridad

Vulnerabilidades por el canal privado, no por issue público. Ver
[SECURITY.md](SECURITY.md).
