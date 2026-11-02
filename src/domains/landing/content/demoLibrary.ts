import type { SpineColor } from "./shelfBooks";

export type DemoTag = "favoritos" | "club" | "ensayo" | "heredados";
export type DemoFilterId = "todos" | DemoTag;

export interface DemoBook {
  title: string;
  author: string;
  color: SpineColor;
  tags: DemoTag[];
}

// Biblioteca de ejemplo del móvil. Son datos inventados, no de ninguna cuenta.
export const demoBooks: DemoBook[] = [
  {
    title: "Don Quijote",
    author: "Miguel de Cervantes",
    color: 1,
    tags: ["heredados", "favoritos"],
  },
  {
    title: "La Regenta",
    author: "Leopoldo Alas «Clarín»",
    color: 3,
    tags: ["club"],
  },
  {
    title: "Rimas",
    author: "Gustavo Adolfo Bécquer",
    color: 6,
    tags: ["heredados", "favoritos"],
  },
  {
    title: "Campos de Castilla",
    author: "Antonio Machado",
    color: 2,
    tags: ["heredados"],
  },
  {
    title: "La Celestina",
    author: "Fernando de Rojas",
    color: 4,
    tags: ["heredados"],
  },
  {
    title: "El sí de las niñas",
    author: "Leandro Fernández de Moratín",
    color: 5,
    tags: ["club"],
  },
  { title: "Niebla", author: "Miguel de Unamuno", color: 2, tags: ["club"] },
  {
    title: "Meditaciones del Quijote",
    author: "José Ortega y Gasset",
    color: 3,
    tags: ["ensayo", "club"],
  },
  {
    title: "Del sentimiento trágico de la vida",
    author: "Miguel de Unamuno",
    color: 1,
    tags: ["ensayo"],
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
  { id: "ensayo", label: "ensayo", announcement: "los de la etiqueta ensayo" },
  {
    id: "heredados",
    label: "heredados",
    announcement: "los de la etiqueta heredados",
  },
];
