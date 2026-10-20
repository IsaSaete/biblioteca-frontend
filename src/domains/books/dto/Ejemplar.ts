import type { BookStatus } from "./BookStatus";
import type { ExternalBook } from "./ExternalBook";

// Correcciones personales sobre el `Libro`, con la forma de sus campos editables.
export type BookOverrides = Partial<
  Pick<
    ExternalBook,
    | "title"
    | "authors"
    | "publisher"
    | "publishedYear"
    | "language"
    | "pageCount"
    | "coverUrl"
    | "coverSource"
    | "synopsis"
    | "categories"
  >
>;

export interface Ejemplar {
  id: string;
  bookId: string;
  status: BookStatus;
  overrides?: BookOverrides;
  createdAt: string;
}
