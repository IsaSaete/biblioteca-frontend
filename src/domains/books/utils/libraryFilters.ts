import type { SortOption } from "../../../components/ui/SortSelector/SortSelector";
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

// Mismas opciones y nombres que el orden de Citas (donde A-Z es por libro).
export const sortOptions: SortOption<BooksSort>[] = [
  {
    value: "recent",
    label: "Fecha: más recientes primero",
    shortLabel: "Fecha ↓",
  },
  {
    value: "oldest",
    label: "Fecha: más antiguas primero",
    shortLabel: "Fecha ↑",
  },
  { value: "alpha", label: "Título: de la A a la Z", shortLabel: "A-Z" },
  { value: "alpha_desc", label: "Título: de la Z a la A", shortLabel: "Z-A" },
];

// Lo que se puede cambiar desde la pantalla Filtros (el orden va aparte).
export type LibraryFilterSelection = Pick<
  LibraryFilters,
  "favorite" | "tag" | "untagged"
>;

// `tag` va explícito para que, al mezclarlo con los filtros actuales, también
// quite la etiqueta.
export const NO_FILTERS: LibraryFilterSelection = {
  favorite: false,
  tag: undefined,
  untagged: false,
};

export const parseLibraryFilters = (
  params: URLSearchParams,
): LibraryFilters => {
  const untagged = params.get("untagged") === "true";
  const tag = params.get("tag")?.trim();

  return {
    sort:
      sortOptions.find((option) => option.value === params.get("sort"))
        ?.value ?? DEFAULT_SORT,
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
