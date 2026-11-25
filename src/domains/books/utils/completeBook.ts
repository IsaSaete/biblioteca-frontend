import type { ExternalBook } from "../dto/ExternalBook";

// La búsqueda por título casi nunca trae la editorial (Google) o nunca la trae
// (Open Library), y a veces tampoco el autor. Si el resultado tiene ISBN, se
// puede completar con `lookup-isbn`, que consulta al otro proveedor (D-047).
export const needsCompletion = (book: ExternalBook): boolean =>
  Boolean(book.isbn) && (!book.publisher || book.authors.length === 0);

// Rellena solo lo que falta en `book` con lo que trae `found`: nunca pisa un
// dato que ya estaba. La portada y su origen van siempre juntos.
export const completeBook = (
  book: ExternalBook,
  found: ExternalBook,
): ExternalBook => ({
  ...book,
  ...(!book.coverUrl &&
    found.coverUrl &&
    found.coverSource && {
      coverUrl: found.coverUrl,
      coverSource: found.coverSource,
    }),
  ...(book.authors.length === 0 &&
    found.authors.length > 0 && { authors: found.authors }),
  ...(!book.publisher && found.publisher && { publisher: found.publisher }),
  ...(!book.publishedYear &&
    found.publishedYear && { publishedYear: found.publishedYear }),
  ...(!book.pageCount && found.pageCount && { pageCount: found.pageCount }),
  ...(!book.language && found.language && { language: found.language }),
  ...(!book.synopsis && found.synopsis && { synopsis: found.synopsis }),
  ...(!book.categories?.length &&
    found.categories?.length && { categories: found.categories }),
});

// Ficha incompleta: al ISBN le falta el autor/a, la editorial o la portada (a
// veces solo trae el título y el año). Entonces se ofrece completarla con las
// fichas que salen al buscar por título.
export const isIncompleteBook = (book: ExternalBook): boolean =>
  book.authors.length === 0 || !book.publisher || !book.coverUrl;

// Solo falta la portada: autor/a y editorial ya están, y se quieren conservar.
export const isMissingOnlyCover = (book: ExternalBook): boolean =>
  book.authors.length > 0 && Boolean(book.publisher) && !book.coverUrl;
