# CLAUDE.md — biblioteca-frontend

Este archivo es un índice operativo, no una copia de la documentación. Antes de trabajar en algo, consulta el documento fuente correspondiente — no asumas ni inventes lo que ya está decidido ahí.

## Qué estamos construyendo

Una biblioteca personal digital (PWA responsive): catalogar libros físicos por ISBN y guardar citas escaneadas con la cámara (OCR en cliente, Tesseract.js). Producto de portfolio construido con estándares profesionales reales, por una única desarrolladora. Detalle completo: `../biblioteca-docs/product-brief-biblioteca-personal.md`.

## Estructura del proyecto

Arquitectura por dominio (`domains/books`, `domains/quotes`, `domains/auth`, `domains/home`, `domains/profile`), componentes compartidos en `components/ui` y `components/navigation`. Estructura completa y regla dominio-vs-compartido: `../biblioteca-docs/arquitectura-tecnica.md`.

## Papel de `biblioteca-docs`

`../biblioteca-docs` es el repositorio de documentación fuente compartida entre frontend y backend, y la fuente de verdad compartida del producto, la arquitectura, el diseño, la API y el backlog.

- Esos documentos no se duplican dentro de este repositorio.
- Antes de tomar una decisión que ya esté documentada, se consulta el documento correspondiente.
- Si una implementación requiere modificar una decisión documentada, no se hace unilateralmente: se solicita confirmación humana.
- La documentación solo se modifica cuando realmente exista una decisión, requisito, componente, ruta, contrato o estructura que deba quedar documentada; no se modifica por cambios puramente internos.

## Stack

React + TypeScript + Vite · MUI (tema personalizado, nunca su piel por defecto) · Redux Toolkit + RTK Query. Librerías complementarias y su papel: `arquitectura-tecnica.md`.

## Documentación fuente

Todos están en `../biblioteca-docs/`. Lee según lo que vayas a hacer — no leas un fichero entero si solo necesitas una parte.

| Cuando vas a… | Lee |
|---|---|
| Crear o cambiar un tipo, DTO o cualquier estructura de datos | `modelo-de-datos.md` |
| Llamar a un endpoint o definir sus tipos | `api-contract.md` (contrato compartido con el backend) |
| Implementar una pantalla o un flujo | La subsección de esa pantalla en `pantallas-y-flujos.md`, no el fichero entero |
| Crear un componente | `inventario-componentes.md` (comprobar si ya existe uno equivalente) |
| Usar un color, tipografía, espaciado o radio | `sistema-diseno-visual.md` |
| Decidir estructura de carpetas, gestión de estado, sesión o theme de MUI | `arquitectura-tecnica.md` |
| Escribir un test, un commit o una rama, o nombrar un archivo | `normas-desarrollo.md` |
| Saber qué construir en el sprint y sus criterios de aceptación | Solo la historia HU-xx en `backlog-historias-usuario.md` |
| Entender por qué existe algo a nivel de producto | `product-brief-biblioteca-personal.md` |
| Nunca por defecto | `historico/auditoria-pre-desarrollo.md` — decisiones ya resueltas; no reabrir lo cerrado ahí |

## Reglas que debe respetar (no negociables)

- **`api-contract.md` es un contrato compartido entre frontend y backend.** Si una implementación necesita un campo, parámetro, respuesta, endpoint o comportamiento que no está contemplado en el contrato: no lo inventes, no modifiques `api-contract.md` unilateralmente y detente para solicitar confirmación humana. La implementación se adapta al contrato existente salvo que exista una decisión explícita de cambiarlo.
- **Cero `any`** en todo el código — usar `unknown` + validación si el tipo no se conoce de antemano. `tsconfig strict` y ESLint lo bloquean, pero no intentes rodear la regla.
- **Toda lógica propia debe estar cubierta por tests.** Los componentes puramente presentacionales (solo reciben props y devuelven JSX, sin lógica propia) pueden quedar sin test; tampoco se escriben tests mecánicos para wrappers triviales, constantes u otros elementos sin lógica propia. Los tests usan RTL, con queries por accesibilidad (rol/label) antes que `test-id`, descripciones en Gherkin y cuerpo en AAA.
- **Nunca mockear `fetch`** — usar MSW.
- Nombres de componentes, variables, funciones y rutas **siempre en inglés**; textos visibles en la interfaz, en español. Convenciones de nombres de archivos y carpetas: `normas-desarrollo.md` e `inventario-componentes.md` — no se inventa una distinta.
- Nunca mostrar en la UI una función que no esté realmente implementada.
- Todo color, tipografía, espaciado o radio sale de `sistema-diseno-visual.md` — nunca un valor suelto en el código.

## Arquitectura (resumen operativo)

- Un componente pertenece a un dominio si es conceptual de una sola entidad; si lo usan varios dominios, va en `components/ui`.
- Estado de servidor con RTK Query, estado de cliente con slices de Redux Toolkit — no se mezclan ni se introduce otra librería de estado.
- Sesión y CSRF: las cookies de sesión no deben manipularse desde JavaScript. El mecanismo de CSRF debe seguir exactamente lo definido en `arquitectura-tecnica.md` (y en la sección Sesión de `api-contract.md`), y no se puede introducir ni modificar su estrategia por cuenta propia.

## Comandos

```
npm run dev          # servidor de desarrollo
npm run build         # build de producción
npm run lint          # ESLint
npm run lint:fix
npm run typecheck     # tsc --noEmit
npm run test           # Vitest (una vez)
npm run test:watch
```

## Testing

Vitest + React Testing Library + MSW. Las reglas de fondo están arriba; la filosofía completa (Kent C. Dodds, prioridad de queries, Gherkin, AAA) está en `normas-desarrollo.md` y no se repite aquí.

## Git

Trunk Based Development. Ramas: `feature/`, `refactor/`, `bugfix/` + kebab-case, siempre desde `main` actualizado. **Nunca commitear directo a `main`** (única excepción: el primer commit de cada repositorio). Commits atómicos, imperativos, en inglés, con mayúscula inicial. Detalle completo: `normas-desarrollo.md`.

## Definition of Done

Una historia se considera terminada cuando, y solo cuando:
- [ ] Los tests pasan (`npm run test`) y cubren la lógica propia del cambio (no se exige test para código puramente presentacional).
- [ ] `npm run lint` y `npm run typecheck` sin errores.
- [ ] Sin ningún `any` nuevo.
- [ ] Las llamadas a la API (rutas, parámetros, tipos de request/response) coinciden exactamente con `api-contract.md`; si algo no está contemplado, se detiene y se solicita confirmación humana.
- [ ] Accesible: navegable por teclado, contraste AA, sin ARIA innecesario.
- [ ] Responsive comprobado en los tres breakpoints (`sistema-diseno-visual.md`).
- [ ] Ningún valor de diseño hardcodeado fuera de los tokens.
- [ ] Documentación: **no todo cambio de código requiere modificar documentación.** Solo se actualiza `biblioteca-docs` cuando el cambio introduce o modifica realmente una decisión, requisito, componente público, ruta, endpoint, campo, contrato, comportamiento o estructura que deba quedar documentada — y en ese caso, en el mismo cambio, no después. Los cambios puramente internos que no alteran ninguna decisión documentada no tocan la documentación. Modificar una decisión ya documentada (o `api-contract.md`) requiere confirmación humana previa.

## Qué puede decidir por su cuenta

- Nombres internos de variables/funciones dentro de las convenciones ya fijadas.
- Estructura interna de un componente (subcomponentes privados, hooks internos) mientras respete el inventario público.
- Elegir entre dos formas igual de válidas de escribir un test, sin cambiar qué se testea.
- Orden de implementación dentro de una misma historia de usuario.

## Qué NO puede decidir por su cuenta (requiere confirmación humana explícita)

- Cambiar el modelo de datos o el contrato de API (`api-contract.md`) — son fuente de verdad compartida con el backend.
- Añadir una dependencia nueva no mencionada en `arquitectura-tecnica.md`.
- Modificar la configuración o la estrategia de sesión, cookies, CORS o CSRF.
- Cambiar cualquier valor del sistema de diseño (color, tipografía, espaciado).
- Modificar o contradecir cualquier decisión ya escrita en `biblioteca-docs` — si algo parece no encajar, se pregunta antes de improvisar.
- Saltarse el Definition of Done "por rapidez".

## Criterio de este archivo

Si una información responde a «¿qué debe hacer Claude siempre?», va en este `CLAUDE.md`. Si responde a «¿cómo se hace X concretamente?», va en el `.md` especializado de `biblioteca-docs`.
