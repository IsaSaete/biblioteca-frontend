# Glosa · frontend

[![Code Audit](https://github.com/IsaSaete/biblioteca-frontend/actions/workflows/audit.yml/badge.svg)](https://github.com/IsaSaete/biblioteca-frontend/actions/workflows/audit.yml)

**Glosa** es una biblioteca personal digital: cataloga los libros físicos que tienes escaneando su código de barras y guarda los pasajes que te importan fotografiándolos con el móvil.

🌐 **[glosaapp.com](https://glosaapp.com)**

Este repositorio es la aplicación web (PWA). La API está en [biblioteca-backend](https://github.com/IsaSaete/biblioteca-backend) y la documentación de producto, diseño y arquitectura en [biblioteca-docs](https://github.com/IsaSaete/biblioteca-docs).

## Qué problema resuelve

Quien tiene una biblioteca en casa no suele tener una forma sencilla de saber qué libros posee, dónde están o a quién se los prestó, ni de guardar las frases que subraya sin acabar con notas sueltas en mil sitios. Glosa junta las dos cosas: un **catálogo** de tu colección real y un **cuaderno de citas** ligado a cada libro.

## Funcionalidades

- **Añadir libros** escaneando el código de barras, escribiendo el ISBN, buscando por título o a mano. Los datos se completan solos desde Google Books y Open Library.
- **Ficha de cada libro** con su ejemplar: ubicación, formato, procedencia, notas, etiquetas, estado de lectura, favorito y préstamo.
- **Citas con la cámara**: haces una foto a la página, recortas el pasaje y el texto se lee **en tu dispositivo** (OCR con Tesseract.js). La foto nunca sale del móvil; solo se guarda el texto.
- **Biblioteca** en cuadrícula o lista, con búsqueda, orden y filtros; y **lista de deseos**.
- **Cuenta**: registro, recuperación de contraseña, descarga de tus datos y eliminación de la cuenta.
- Tema claro y oscuro, diseño adaptable (móvil, tablet y escritorio), accesibilidad AA e instalable como PWA.

## Stack

| Área        | Tecnología                                                                               |
| ----------- | ---------------------------------------------------------------------------------------- |
| Base        | React 19, TypeScript (estricto, sin `any`), Vite                                         |
| Interfaz    | MUI con tema propio                                                                      |
| Estado      | Redux Toolkit y RTK Query (servidor); React Router                                       |
| Formularios | react-hook-form y Zod                                                                    |
| Cámara      | `BarcodeDetector` nativo o `barcode-detector` (ZXing en WebAssembly); Tesseract.js       |
| Calidad     | Vitest, React Testing Library, MSW, vitest-axe, ESLint (con `jsx-a11y`), Prettier, Husky |

## Requisitos

- Node.js 22 o superior y npm.
- La API en marcha. En local, [biblioteca-backend](https://github.com/IsaSaete/biblioteca-backend) en `http://localhost:4000`.

## Puesta en marcha

```bash
git clone https://github.com/IsaSaete/biblioteca-frontend.git
cd biblioteca-frontend
npm ci
cp .env.example .env
npm run dev
```

La aplicación queda en `http://localhost:5173`. Las llamadas a `/api` las reenvía el servidor de Vite al backend, así que el navegador siempre habla con un único origen (y las cookies de sesión funcionan igual que en producción).

### Variables de entorno

Las dos son opcionales (ver `.env.example`):

| Variable           | Para qué                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------ |
| `API_PROXY_TARGET` | Backend al que apunta el proxy de Vite en desarrollo. Por defecto `http://localhost:4000`. |
| `VITE_API_URL`     | Solo para llamar a un backend en otro origen. Vacía, la API se usa en `/api`.              |

## Scripts

| Comando                     | Qué hace                                                        |
| --------------------------- | --------------------------------------------------------------- |
| `npm run dev`               | Servidor de desarrollo                                          |
| `npm run build`             | Compilación de producción                                       |
| `npm run preview`           | Sirve la compilación en local                                   |
| `npm run test`              | Tests (una vez) · `npm run test:watch` para el modo interactivo |
| `npm run lint` · `lint:fix` | ESLint                                                          |
| `npm run typecheck`         | Comprueba los tipos sin compilar                                |

## Estructura

```
src/
├── domains/      # Un directorio por dominio: auth, books, quotes, wishlist, home, profile, landing, legal
├── components/   # ui/ (compartidos) y navigation/
├── api/          # Cliente HTTP y renovación de sesión
├── store/        # Redux Toolkit
├── theme/        # Tema de MUI y tokens de diseño
└── router/       # Rutas y protección de las pantallas con sesión
```

Un componente vive en su dominio si pertenece a una sola entidad; si lo usan varios, va en `components/ui`. El detalle está en [`arquitectura-tecnica.md`](https://github.com/IsaSaete/biblioteca-docs/blob/main/arquitectura-tecnica.md).

## Calidad y testing

- Los tests usan **MSW** para simular la API (no se simula `fetch`) y consultas por rol y etiqueta, como las usaría una persona o un lector de pantalla.
- **Husky** ejecuta lint y formato antes de cada commit y valida el mensaje; GitHub Actions lanza lint, tests y build en cada PR.
- Las pantallas pasan reglas de accesibilidad automáticas (`vitest-axe`).

## Despliegue

Se publica en **Netlify** con dominio propio. En producción, Netlify reenvía `/api/*` al backend (alojado en Render), de modo que web y API comparten origen y las cookies de sesión no necesitan configuración cross-site. Cada PR genera una vista previa.

> El backend está en un plan gratuito que se duerme si no recibe tráfico: la primera petición tras un rato puede tardar unos segundos. La web lo despierta al cargar la página principal.

## Cómo contribuir

El proyecto sigue **Trunk Based Development**: ramas cortas `feature/`, `bugfix/` o `refactor/` creadas desde `main` actualizado, una PR por rama y commits pequeños, atómicos, en inglés e imperativos (máximo 72 caracteres). Las normas completas están en [`normas-desarrollo.md`](https://github.com/IsaSaete/biblioteca-docs/blob/main/normas-desarrollo.md).

## Documentación

Toda la documentación vive en [biblioteca-docs](https://github.com/IsaSaete/biblioteca-docs): producto, modelo de datos, contrato de la API, pantallas y flujos, sistema de diseño y el registro de decisiones.

---

Proyecto de portfolio desarrollado por [@IsaSaete](https://github.com/IsaSaete).
