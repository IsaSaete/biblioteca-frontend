import type { LibraryBook } from "../dto/LibraryBook";
import type { UpdateEjemplarRequest } from "../dto/UpdateEjemplarRequest";
import { parseAuthors } from "./confirmBookSchema";
import type { BookDataFormValues } from "./editBookSchema";

type Overrides = NonNullable<UpdateEjemplarRequest["overrides"]>;

const sameList = (a: string[], b: string[]): boolean =>
  a.length === b.length && a.every((item, index) => item === b[index]);

// Solo viajan los campos que el usuario cambió respecto a lo que ve. Vaciar un
// campo opcional que tenía valor manda `null`: el servidor borra esa corrección
// y vuelve a verse el dato original del libro. `undefined` = nada que guardar.
export const buildOverridesRequest = (
  book: LibraryBook,
  values: BookDataFormValues,
): Overrides | undefined => {
  const overrides: Overrides = {};
  const title = values.title.trim();
  const publisher = values.publisher.trim();
  const authors = parseAuthors(values.authors);
  const categories = parseAuthors(values.categories);
  const language = values.language.trim();
  const synopsis = values.synopsis.trim();

  if (title !== book.title) {
    overrides.title = title;
  }
  if (publisher !== book.publisher) {
    overrides.publisher = publisher;
  }
  if (!sameList(authors, book.authors)) {
    overrides.authors = authors;
  }

  const numeric = [
    ["publishedYear", values.publishedYear, book.publishedYear],
    ["pageCount", values.pageCount, book.pageCount],
  ] as const;

  for (const [key, text, current] of numeric) {
    const next = text === "" ? null : Number(text);

    if (next !== (current ?? null)) {
      overrides[key] = next;
    }
  }

  if (language !== (book.language ?? "")) {
    overrides.language = language || null;
  }
  if (synopsis !== (book.synopsis ?? "")) {
    overrides.synopsis = synopsis || null;
  }
  if (!sameList(categories, book.categories ?? [])) {
    overrides.categories = categories.length > 0 ? categories : null;
  }

  return Object.keys(overrides).length > 0 ? overrides : undefined;
};
