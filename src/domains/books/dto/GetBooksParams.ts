export type BooksSort = "recent" | "alpha";

// Los filtros (search, tag, status, favorite) todavía no existen en el backend.
export interface GetBooksParams {
  sort?: BooksSort;
  cursor?: string;
}
