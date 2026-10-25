// `book` y `book_desc` agrupan por libro (título A-Z o Z-A).
export type QuotesSort = "recent" | "oldest" | "book" | "book_desc";

// Sin filtros → feed completo; con `bookId` → solo las citas de ese libro; con
// `unlinked` → solo las citas sin libro (no se combinan). `sort=book` y
// `book_desc` agrupan por libro; el cursor solo vale para el orden con el que se pidió.
export interface GetQuotesParams {
  bookId?: string;
  unlinked?: boolean;
  sort?: QuotesSort;
  cursor?: string;
}
