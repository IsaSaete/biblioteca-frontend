import type { SpineColor } from "./shelfBooks";

export type DemoTag = "favoritos" | "club" | "musica" | "heredados";
export type DemoFilterId = "todos" | DemoTag;

export interface DemoBook {
  title: string;
  author: string;
  color: SpineColor;
  tags: DemoTag[];
}

// Biblioteca de ejemplo del móvil. Son libros reales con etiquetas inventadas,
// no de ninguna cuenta. Cada etiqueta tiene al menos dos libros.
export const demoBooks: DemoBook[] = [
  {
    title: "1984",
    author: "George Orwell",
    color: 3,
    tags: ["heredados", "favoritos"],
  },
  {
    title: "Un mundo feliz",
    author: "Aldous Huxley",
    color: 1,
    tags: ["club", "heredados"],
  },
  {
    title: "La mujer habitada",
    author: "Gioconda Belli",
    color: 2,
    tags: ["club", "favoritos"],
  },
  {
    title: "Energy Flash",
    author: "Simon Reynolds",
    color: 5,
    tags: ["musica"],
  },
  {
    title: "Una habitación propia",
    author: "Virginia Woolf",
    color: 6,
    tags: ["favoritos"],
  },
  { title: "Cara de pan", author: "Sara Mesa", color: 4, tags: ["club"] },
  {
    title: "Por favor, mátame",
    author: "Legs McNeil y Gillian McCain",
    color: 1,
    tags: ["musica"],
  },
  {
    title: "Crónicas marcianas",
    author: "Ray Bradbury",
    color: 2,
    tags: ["heredados"],
  },
  {
    title: "Calibán y la bruja",
    author: "Silvia Federici",
    color: 3,
    tags: ["heredados"],
  },
];

// `label` es lo que dice la pastilla; `announcement`, cómo se nombra el filtro
// cuando se anuncia el resultado a quien usa un lector de pantalla.
export const demoFilters: {
  id: DemoFilterId;
  label: string;
  announcement: string;
}[] = [
  { id: "todos", label: "Todos", announcement: "todos los libros" },
  { id: "favoritos", label: "Favoritos", announcement: "los favoritos" },
  {
    id: "club",
    label: "club de lectura",
    announcement: "los de la etiqueta club de lectura",
  },
  { id: "musica", label: "música", announcement: "los de la etiqueta música" },
  {
    id: "heredados",
    label: "heredados",
    announcement: "los de la etiqueta heredados",
  },
];
