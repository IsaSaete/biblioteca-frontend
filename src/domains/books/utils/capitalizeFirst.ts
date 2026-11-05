// Solo para mostrar: "estantería" se ve como "Estantería" sin cambiar lo guardado.
export const capitalizeFirst = (text: string): string =>
  text.charAt(0).toLocaleUpperCase("es") + text.slice(1);

// Solo para mostrar: cada palabra empieza en mayúscula ("ciencia ficción" se ve
// como "Ciencia Ficción") sin cambiar lo guardado.
export const capitalizeWords = (text: string): string =>
  text.split(" ").map(capitalizeFirst).join(" ");

// Partículas que en un nombre propio se quedan en minúscula si no abren el nombre.
const NAME_PARTICLES = new Set(["de", "del", "la", "las", "los", "y", "e"]);

// Solo para mostrar: «maría lópez» se ve como «María López» y «juan de la cruz»
// como «Juan de la Cruz», sin cambiar lo guardado.
export const capitalizeName = (name: string): string =>
  name
    .split(" ")
    .map((word, index) =>
      index > 0 && NAME_PARTICLES.has(word.toLocaleLowerCase("es"))
        ? word
        : capitalizeFirst(word),
    )
    .join(" ");
