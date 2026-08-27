# Security policy

**English** · [Español](#política-de-seguridad)

## Reporting a vulnerability

**Do not open a public issue.** Use GitHub's private reporting:

[Report a vulnerability](https://github.com/Foralitos/sweeply/security/advisories/new)

Include: sweeply version, operating system, steps to reproduce and impact.
Expected response within 72 hours; once confirmed, the fix ships in a patch and
the advisory is published crediting the reporter (unless they prefer to stay
anonymous).

## Supported versions

Only the latest version published to npm receives security patches.

## Risk surface

sweeply **deletes directories**, so its main risk is deleting the wrong thing.
Design guarantees:

- It only deletes paths the scanner classified as regenerable
  (`node_modules`, `.next`, `dist`, `venv`, `target`, `Pods`…), never code.
- Every target requires its manifest next to it (`dist` only counts when there
  is a `package.json` beside it, `target` only with `Cargo.toml`), to avoid
  false positives.
- It always asks for interactive confirmation. **There is no `--yes` flag** and
  no unattended mode, on purpose.
- No network requests other than a once-a-day version check against the npm
  registry, which can be disabled with `NO_UPDATE_NOTIFIER=1` and is skipped
  when `CI` is set. No telemetry, no credential reads.

If you find a path where sweeply deletes something outside that classification,
that is a vulnerability — report it through the private channel above.

## Supply chain

- Actions are pinned by SHA.
- Runtime dependencies: only `ink` and `react`.
- The release workflow (`.github/workflows/publish.yml`) is set up for
  [trusted publishing](https://docs.npmjs.com/trusted-publishers) (OIDC, no
  long-lived tokens) with verifiable
  [provenance](https://docs.npmjs.com/generating-provenance-statements).
  **Not yet in effect:** the trusted publisher is not registered on the npm side
  yet, so versions up to and including `0.2.0` were published manually and carry
  **no provenance attestation**. Do not rely on provenance to verify those
  versions.

---

# Política de seguridad

[English](#security-policy) · **Español**

## Reportar una vulnerabilidad

**No abras un issue público.** Usa el reporte privado de GitHub:

[Report a vulnerability](https://github.com/Foralitos/sweeply/security/advisories/new)

Incluye: versión de sweeply, sistema operativo, pasos para reproducir e impacto.
Respuesta esperada en 72 horas; si se confirma, el fix sale en un parche y el
advisory se publica con crédito a quien reportó (salvo que prefiera anonimato).

## Versiones soportadas

Solo la última versión publicada en npm recibe parches de seguridad.

## Superficie de riesgo

sweeply **borra directorios**, así que su riesgo principal es el borrado
indebido. Garantías del diseño:

- Solo borra rutas clasificadas por el scanner como regenerables
  (`node_modules`, `.next`, `dist`, `venv`, `target`, `Pods`…), nunca código.
- Cada target exige su manifest al lado (`dist` solo cuenta si hay
  `package.json` junto, `target` solo con `Cargo.toml`), para evitar falsos
  positivos.
- Siempre pide confirmación interactiva. **No existe un flag `--yes`** ni modo
  desatendido, a propósito.
- No hace peticiones de red salvo un chequeo de versión una vez al día contra el
  registry de npm, que se apaga con `NO_UPDATE_NOTIFIER=1` y se omite si hay
  `CI`. No hay telemetría ni lectura de credenciales.

Si encuentras una ruta con la que sweeply borre algo fuera de esa clasificación,
eso es una vulnerabilidad — repórtala por el canal privado de arriba.

## Cadena de suministro

- Las actions están pineadas por SHA.
- Dependencias en runtime: solo `ink` y `react`.
- El workflow de release (`.github/workflows/publish.yml`) está armado para
  [trusted publishing](https://docs.npmjs.com/trusted-publishers) (OIDC, sin
  tokens de larga vida) con [provenance](https://docs.npmjs.com/generating-provenance-statements)
  verificable. **Todavía no está en vigor:** falta registrar el trusted publisher
  del lado de npm, así que las versiones hasta la `0.2.0` inclusive se publicaron
  a mano y **no tienen provenance**. No uses provenance para verificar esas
  versiones.
