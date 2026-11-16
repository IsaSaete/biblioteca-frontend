import type { SpineColor } from "./shelfBooks";

export type DemoTag = "club" | "musica" | "heredados";

export interface DemoBook {
  title: string;
  author: string;
  color: SpineColor;
  tags: DemoTag[];
  favorite: boolean;
  lent: boolean;
}

// Etiquetas del móvil de ejemplo y cómo se escriben.
export const demoTags: { id: DemoTag; label: string }[] = [
  { id: "club", label: "club de lectura" },
  { id: "musica", label: "música" },
  { id: "heredados", label: "heredados" },
];

// Biblioteca de ejemplo del móvil. Son libros reales con etiquetas, favoritos y
// préstamos inventados, no de ninguna cuenta. Son pocos a propósito: el móvil
// los enseña todos, así que el número de «Ver N libros» es siempre lo que se ve.
// Ningún estado de lectura, que la app no filtra.
export const demoBooks: DemoBook[] = [
  {
    title: "1984",
    author: "George Orwell",
    color: 3,
    tags: ["heredados"],
    favorite: true,
    lent: false,
  },
  {
    title: "Un mundo feliz",
    author: "Aldous Huxley",
    color: 1,
    tags: ["club", "heredados"],
    favorite: false,
    lent: true,
  },
  {
    title: "La mujer habitada",
    author: "Gioconda Belli",
    color: 2,
    tags: ["club"],
    favorite: true,
    lent: false,
  },
  {
    title: "Energy Flash",
    author: "Simon Reynolds",
    color: 5,
    tags: ["musica"],
    favorite: false,
    lent: false,
  },
  {
    title: "Cara de pan",
    author: "Sara Mesa",
    color: 4,
    tags: ["club"],
    favorite: false,
    lent: true,
  },
  {
    title: "Por favor, mátame",
    author: "Legs McNeil y Gillian McCain",
    color: 1,
    tags: ["musica"],
    favorite: true,
    lent: false,
  },
];
