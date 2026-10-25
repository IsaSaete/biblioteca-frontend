import type { BooksSort, GetBooksParams } from "../dto/GetBooksParams";

// Orden y filtros de Biblioteca. Viven en la URL
// (`?sort=&favorite=&tag=&untagged=`) para que volver desde una ficha, o llegar
// desde «Favoritos» de Inicio, los conserve.
export interface LibraryFilters {
  sort: BooksSort;
  favorite: boolean;
  tag?: string;
  untagged: boolean;
}

export const DEFAULT_SORT: BooksSort = "recent";

export const sortLabels: Record<BooksSort, string> = {
  recent: "Añadidos",
  alpha: "Alfabético",
};

// Lo que se puede cambiar desde la pantalla Filtros (el orden va aparte).
export type LibraryFilterSelection = Pick<
  LibraryFilters,
  "favorite" | "tag" | "untagged"
>;

export const NO_FILTERS: LibraryFilterSelection = {
  favorite: false,
  untagged: false,
};

export const parseLibraryFilters = (
  params: URLSearchParams,
): LibraryFilters => {
  const untagged = params.get("untagged") === "true";
  const tag = params.get("tag")?.trim();

  return {
    sort: params.get("sort") === "alpha" ? "alpha" : DEFAULT_SORT,
    favorite: params.get("favorite") === "true",
    untagged,
    // El contrato no combina «Sin catalogar» con una etiqueta.
    tag: !untagged && tag ? tag : undefined,
  };
};

export const toSearchParams = (filters: LibraryFilters): URLSearchParams => {
  const params = new URLSearchParams();

  if (filters.sort !== DEFAULT_SORT) {
    params.set("sort", filters.sort);
  }
  if (filters.favorite) {
    params.set("favorite", "true");
  }
  if (filters.untagged) {
    params.set("untagged", "true");
  } else if (filters.tag) {
    params.set("tag", filters.tag);
  }

  return params;
};

export const hasActiveFilters = ({
  favorite,
  tag,
  untagged,
}: LibraryFilterSelection): boolean => favorite || untagged || Boolean(tag);

// Sin nada que enviar devuelve `undefined`: así la consulta comparte caché con
// la de Inicio (`useGetBooksQuery()`).
export const toBooksParams = (
  filters: LibraryFilters,
): GetBooksParams | undefined => {
  const params: GetBooksParams = {};

  if (filters.sort !== DEFAULT_SORT) {
    params.sort = filters.sort;
  }
  if (filters.favorite) {
    params.favorite = true;
  }
  if (filters.untagged) {
    params.untagged = true;
  } else if (filters.tag) {
    params.tag = filters.tag;
  }

  return Object.keys(params).length > 0 ? params : undefined;
};
