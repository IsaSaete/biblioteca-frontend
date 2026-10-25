import type { SortOption } from "../../../components/ui/SortSelector/SortSelector";
import type { QuotesSort } from "../dto/GetQuotesParams";

export const DEFAULT_QUOTES_SORT: QuotesSort = "recent";

const allOptions: SortOption<QuotesSort>[] = [
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
  { value: "book", label: "Libro: de la A a la Z", shortLabel: "Libro A-Z" },
  {
    value: "book_desc",
    label: "Libro: de la Z a la A",
    shortLabel: "Libro Z-A",
  },
];

export const isGroupedByBook = (sort: QuotesSort): boolean =>
  sort === "book" || sort === "book_desc";

// «Libro» agrupa las citas de todos los libros; con un libro (o las citas
// sin libro) ya elegido no aporta nada, así que no se ofrece.
export const getQuotesSortOptions = (isFilteredByBook: boolean) =>
  isFilteredByBook
    ? allOptions.filter((option) => !isGroupedByBook(option.value))
    : allOptions;

export const parseQuotesSort = (
  value: string | null,
  isFilteredByBook: boolean,
): QuotesSort => {
  const option = getQuotesSortOptions(isFilteredByBook).find(
    (candidate) => candidate.value === value,
  );

  return option?.value ?? DEFAULT_QUOTES_SORT;
};
