// Lomos de la estantería de la portada. Los títulos son provisionales: Isa los
// revisará para que cuenten algo. Medidas en px de escritorio; el componente
// las escala en pantallas pequeñas.
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

export const ownedBooks: ShelfBook[] = [
  { title: "Don Quijote", height: 276, width: 46, color: 1, label: true },
  { title: "La Regenta", height: 300, width: 54, color: 3 },
  { title: "Niebla", height: 214, width: 36, color: 6, optional: true },
  {
    title: "Fortunata y Jacinta",
    height: 318,
    width: 58,
    color: 2,
    label: true,
  },
  { title: "Marianela", height: 262, width: 42, color: 3 },
  { title: "Misericordia", height: 232, width: 40, color: 5 },
  { title: "La Celestina", height: 284, width: 48, color: 4, optional: true },
  { title: "Rimas", height: 206, width: 34, color: 1 },
  {
    title: "Campos de Castilla",
    height: 308,
    width: 52,
    color: 6,
    label: true,
  },
  { title: "Lazarillo", height: 224, width: 38, color: 2, optional: true },
  { title: "Pepita Jiménez", height: 270, width: 46, color: 5, optional: true },
  { title: "Tormento", height: 238, width: 40, color: 3, optional: true },
  {
    title: "El Sí de las niñas",
    height: 292,
    width: 50,
    color: 4,
    optional: true,
  },
  {
    title: "Platero",
    height: 196,
    width: 32,
    color: 1,
    leaning: true,
    optional: true,
  },
];

export const wishlistBooks: ShelfBook[] = [
  { title: "Pedro Páramo", height: 250, width: 42 },
  { title: "Rayuela", height: 290, width: 50 },
  { title: "La tregua", height: 222, width: 38 },
  { title: "El Aleph", height: 268, width: 44, optional: true },
];

// Montón tumbado: ancho de cada libro (px de escritorio) y su color.
export const pileBooks: { width: number; color: SpineColor }[] = [
  { width: 150, color: 5 },
  { width: 128, color: 6 },
  { width: 140, color: 3 },
];
