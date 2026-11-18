// Cada pantalla se descarga cuando se visita, y sus archivos llevan un código en
// el nombre que cambia con cada versión. Si se despliega una versión nueva con
// la web abierta, pedir una pantalla con el nombre antiguo falla. No es un error
// de programación: basta recargar. Cada navegador lo dice con sus palabras.
const CHUNK_ERROR_MESSAGES = [
  // Chrome, Edge
  "failed to fetch dynamically imported module",
  // Firefox
  "error loading dynamically imported module",
  // Safari
  "importing a module script failed",
];

export const isChunkLoadError = (error: unknown): boolean => {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  if ("name" in error && error.name === "ChunkLoadError") {
    return true;
  }

  if (!("message" in error) || typeof error.message !== "string") {
    return false;
  }

  const message = error.message.toLowerCase();

  return CHUNK_ERROR_MESSAGES.some((known) => message.includes(known));
};
