// Solo para mostrar: "estantería" se ve como "Estantería" sin cambiar lo guardado.
export const capitalizeFirst = (text: string): string =>
  text.charAt(0).toLocaleUpperCase("es") + text.slice(1);

// Solo para mostrar: cada palabra empieza en mayúscula ("ciencia ficción" se ve
// como "Ciencia Ficción") sin cambiar lo guardado.
export const capitalizeWords = (text: string): string =>
  text.split(" ").map(capitalizeFirst).join(" ");
