import type { BookFormat } from "./BookFormat";
import type { BookProvenance } from "./BookProvenance";
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

// Si el libro está prestado, a quién y desde cuándo (`lentAt` en ISO 8601).
export interface Loan {
  borrowerName: string;
  lentAt: string;
}

// `favorite` siempre viene (`false` por defecto); el resto de campos personales
// se omiten mientras estén vacíos (api-contract.md, `books`).
export interface Ejemplar {
  id: string;
  bookId: string;
  status: BookStatus;
  favorite: boolean;
  location?: string;
  format?: BookFormat;
  provenance?: BookProvenance;
  acquisitionDate?: string;
  notes?: string;
  tags?: string[];
  loan?: Loan;
  overrides?: BookOverrides;
  createdAt: string;
}
