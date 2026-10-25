export type BooksSort = "recent" | "alpha";

// Los filtros se combinan entre sí, con `search` y con `sort` (api-contract.md).
// `status` no existe (D-026) y `untagged` no se combina con `tag`.
export interface GetBooksParams {
  sort?: BooksSort;
  // Título, autor o etiquetas de tu propia biblioteca.
  search?: string;
  // Solo `true` filtra: `false` o ausente es no filtrar.
  favorite?: boolean;
  // Una sola etiqueta, sin distinguir mayúsculas.
  tag?: string;
  // Libros sin ninguna etiqueta («Sin catalogar»).
  untagged?: boolean;
  cursor?: string;
}
