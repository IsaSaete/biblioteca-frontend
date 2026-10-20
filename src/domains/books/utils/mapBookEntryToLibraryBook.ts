import type { BookEntry } from "../dto/BookEntry";
import type { LibraryBook } from "../dto/LibraryBook";

// Si el ejemplar corrige un campo, manda el valor del override; si no, el de `book`.
export const mapBookEntryToLibraryBook = ({
  book,
  ejemplar,
}: BookEntry): LibraryBook => {
  const definedOverrides = Object.fromEntries(
    Object.entries(ejemplar.overrides ?? {}).filter(
      ([, value]) => value !== undefined && value !== null,
    ),
  );

  return {
    ...book,
    ...definedOverrides,
    ejemplarId: ejemplar.id,
    status: ejemplar.status,
  };
};
