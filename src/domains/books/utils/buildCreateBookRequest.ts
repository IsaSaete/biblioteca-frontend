import type { BookStatus } from "../dto/BookStatus";
import type { CreateBookRequest } from "../dto/CreateBookRequest";
import type { ExternalBook } from "../dto/ExternalBook";
import { parseAuthors } from "./confirmBookSchema";
import type { ConfirmBookFormValues } from "./confirmBookSchema";

// Reenvía el `book` consultado con lo que el usuario corrigió (el backend
// decide si es un override); lo que no se edita (sinopsis, géneros, portada)
// viaja tal cual. `coverUrl` y `coverSource` van juntos o ninguno.
export const buildCreateBookRequest = (
  book: ExternalBook | null,
  values: ConfirmBookFormValues,
  status: BookStatus,
): CreateBookRequest => {
  const { publishedYear, language, pageCount } = values;
  const hasCover =
    book?.coverUrl !== undefined && book.coverSource !== undefined;

  return {
    ...(book?.isbn && { isbn: book.isbn }),
    title: values.title.trim(),
    authors: parseAuthors(values.authors),
    publisher: values.publisher.trim(),
    ...(publishedYear && { publishedYear: Number(publishedYear) }),
    ...(pageCount && { pageCount: Number(pageCount) }),
    ...(language && { language }),
    ...(hasCover && { coverUrl: book.coverUrl, coverSource: book.coverSource }),
    ...(book?.synopsis && { synopsis: book.synopsis }),
    ...(book?.categories && { categories: book.categories }),
    status,
  };
};
