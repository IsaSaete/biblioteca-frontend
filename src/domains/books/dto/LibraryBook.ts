import type { BookStatus } from "./BookStatus";
import type { Ejemplar } from "./Ejemplar";
import type { SavedBook } from "./SavedBook";

// Libro tal y como lo ve el usuario: los overrides de su ejemplar ya aplicados,
// más los datos personales de su ejemplar.
export interface LibraryBook
  extends
    SavedBook,
    Pick<
      Ejemplar,
      | "favorite"
      | "location"
      | "format"
      | "provenance"
      | "acquisitionDate"
      | "notes"
      | "tags"
    > {
  ejemplarId: string;
  status: BookStatus;
}
