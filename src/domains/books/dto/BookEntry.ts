import type { Ejemplar } from "./Ejemplar";
import type { SavedBook } from "./SavedBook";

// Respuesta de POST /books y elemento de GET /books.
export interface BookEntry {
  book: SavedBook;
  ejemplar: Ejemplar;
}
