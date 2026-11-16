import { demoTags } from "../content/demoLibrary";
import type { DemoBook, DemoTag } from "../content/demoLibrary";

// Lo mismo que la hoja «Filtros» de la app: Favoritos y Prestados se combinan
// con una etiqueta, y solo se elige una etiqueta a la vez.
export interface DemoSelection {
  favorite: boolean;
  lent: boolean;
  tag?: DemoTag;
}

export const NO_DEMO_FILTERS: DemoSelection = {
  favorite: false,
  lent: false,
  tag: undefined,
};

export const hasDemoFilters = (selection: DemoSelection): boolean =>
  selection.favorite || selection.lent || selection.tag !== undefined;

export const matchesSelection = (
  book: DemoBook,
  selection: DemoSelection,
): boolean =>
  (!selection.favorite || book.favorite) &&
  (!selection.lent || book.lent) &&
  (selection.tag === undefined || book.tags.includes(selection.tag));

export const countBooks = (count: number): string =>
  `${count} ${count === 1 ? "libro" : "libros"}`;

export const countWithTag = (books: DemoBook[], tag: DemoTag): number =>
  books.filter((book) => book.tags.includes(tag)).length;

export const getTagLabel = (tag: DemoTag): string =>
  demoTags.find(({ id }) => id === tag)?.label ?? tag;

// Cómo se nombra lo elegido cuando se anuncia el resultado a quien usa un
// lector de pantalla.
export const describeSelection = (selection: DemoSelection): string => {
  const parts = [
    ...(selection.favorite ? ["los favoritos"] : []),
    ...(selection.lent ? ["los prestados"] : []),
    ...(selection.tag
      ? [`los de la etiqueta ${getTagLabel(selection.tag)}`]
      : []),
  ];

  if (parts.length === 0) {
    return "todos los libros";
  }

  return parts.length === 1
    ? parts[0]
    : `${parts.slice(0, -1).join(", ")} y ${parts[parts.length - 1]}`;
};
