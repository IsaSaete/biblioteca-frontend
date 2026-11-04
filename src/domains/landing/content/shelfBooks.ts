// Lomos de la estantería de la portada. Medidas en px de escritorio; el
// componente las escala en pantallas pequeñas.
export type SpineColor = 1 | 2 | 3 | 4 | 5 | 6;

export interface ShelfBook {
  title: string;
  height: number;
  width: number;
  color?: SpineColor;
  // Pegatina de signatura en el lomo.
  label?: boolean;
  // Se oculta en móvil para que la balda no se desborde.
  optional?: boolean;
  // Apoyado en el siguiente.
  leaning?: boolean;
}

// Los libros de Isa y, completando, otros en su línea: distopía, ciencia
// ficción, ensayo feminista y clásicos. `optional` los oculta en móvil.
export const ownedBooks: ShelfBook[] = [
  { title: "Loops", height: 276, width: 50, color: 1, label: true },
  { title: "Un mundo feliz", height: 300, width: 44, color: 3 },
  { title: "La mujer habitada", height: 262, width: 56, color: 2 },
  { title: "La conejera", height: 230, width: 42, color: 6, optional: true },
  { title: "1984", height: 206, width: 34, color: 5, label: true },
  { title: "La Odisea", height: 292, width: 50, color: 4 },
  { title: "Cara de pan", height: 238, width: 44, color: 1, optional: true },
  {
    title: "Crónicas marcianas",
    height: 318,
    width: 58,
    color: 3,
    label: true,
    optional: true,
  },
  {
    title: "Los usurpadores",
    height: 270,
    width: 48,
    color: 6,
    optional: true,
  },
  { title: "Una habitación propia", height: 304, width: 54, color: 2 },
  {
    title: "Calibán y la bruja",
    height: 284,
    width: 52,
    color: 5,
    optional: true,
  },
  {
    title: "Fahrenheit 451",
    height: 308,
    width: 56,
    color: 4,
    optional: true,
  },
  { title: "Electroshock", height: 196, width: 34, color: 1, leaning: true },
];

export const wishlistBooks: ShelfBook[] = [
  { title: "Solaris", height: 250, width: 42 },
  { title: "Kindred", height: 290, width: 50 },
  { title: "Orlando", height: 222, width: 38 },
  { title: "Los desposeídos", height: 268, width: 46, optional: true },
];

// Montón tumbado, de arriba abajo: ancho de cada libro (px de escritorio) y el
// color de sus tapas. `darkColor` lo sustituye en modo oscuro, donde el lomo 3
// es crema como las hojas y no se distinguiría.
export const pileBooks: {
  width: number;
  color: SpineColor;
  darkColor?: SpineColor;
}[] = [
  { width: 150, color: 1 },
  { width: 140, color: 3, darkColor: 4 },
  { width: 150, color: 2 },
];
