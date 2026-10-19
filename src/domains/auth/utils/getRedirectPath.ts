const DEFAULT_PATH = "/library";

// Destino tras iniciar sesión: la ruta que el usuario intentó abrir, solo si
// es una ruta interna (nunca una URL externa).
export const getRedirectPath = (state: unknown): string => {
  if (typeof state !== "object" || state === null || !("from" in state)) {
    return DEFAULT_PATH;
  }

  const { from } = state;

  return typeof from === "string" &&
    from.startsWith("/") &&
    !from.startsWith("//")
    ? from
    : DEFAULT_PATH;
};
