// Iniciales para el avatar: primera letra de las dos primeras palabras.
export const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .filter((word) => word !== "")
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
