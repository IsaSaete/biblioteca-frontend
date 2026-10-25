import type { BookEntry } from "./BookEntry";

// `total` cuenta todos los libros que cumplen los filtros, no solo los de la
// tanda: da el «Ver X libros» de la pantalla Filtros.
export interface GetBooksResponse {
  items: BookEntry[];
  nextCursor: string | null;
  total: number;
}
