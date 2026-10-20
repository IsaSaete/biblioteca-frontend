export type CoverSource = "google_books" | "open_library";

// `book` de lookup-isbn y search-external: aún no guardado, sin `id`. Los campos
// que el proveedor no da se omiten (no vienen `null`) y `coverSource` solo viene
// si hay `coverUrl` (api-contract.md, `books`; D-017).
export interface ExternalBook {
  isbn?: string;
  title: string;
  authors: string[];
  publisher?: string;
  publishedYear?: number;
  pageCount?: number;
  language?: string;
  coverUrl?: string;
  coverSource?: CoverSource;
  synopsis?: string;
  categories?: string[];
}
