import type { BookStatus } from "./BookStatus";
import type { SavedBook } from "./SavedBook";

// Libro tal y como lo ve el usuario: los overrides de su ejemplar ya aplicados.
export interface LibraryBook extends SavedBook {
  ejemplarId: string;
  status: BookStatus;
}
