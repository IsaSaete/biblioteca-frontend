export type BooksSort = "recent" | "alpha";

// Los filtros tag, status y favorite todavía no existen en el backend.
export interface GetBooksParams {
  sort?: BooksSort;
  // Título, autor o etiquetas de tu propia biblioteca (api-contract.md).
  search?: string;
  cursor?: string;
}
