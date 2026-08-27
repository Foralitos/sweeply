# Política de seguridad

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
- No hace peticiones de red, no telemetría, no lee credenciales.

Si encuentras una ruta con la que sweeply borre algo fuera de esa clasificación,
eso es una vulnerabilidad — repórtala por el canal privado de arriba.

## Cadena de suministro

- Se publica desde GitHub Actions con [trusted publishing](https://docs.npmjs.com/trusted-publishers)
  (OIDC, sin tokens de larga vida) y con [provenance](https://docs.npmjs.com/generating-provenance-statements)
  verificable.
- Las actions están pineadas por SHA.
- Dependencias en runtime: solo `ink` y `react`.
