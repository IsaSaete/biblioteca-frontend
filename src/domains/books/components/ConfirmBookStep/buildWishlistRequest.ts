import type { ExternalBook } from "../../dto/ExternalBook";
import { buildCreateBookRequest } from "../../utils/buildCreateBookRequest";
import type { ConfirmBookFormValues } from "../../utils/confirmBookSchema";

// Lo que se envía a la lista de deseos: los datos del libro, sin estado de
// lectura, y la nota solo si hay una (ya recortada).
export const buildWishlistRequest = (
  book: ExternalBook,
  values: ConfirmBookFormValues,
  note?: string,
) => {
  const trimmedNote = note?.trim();

  return {
    ...buildCreateBookRequest(book, values),
    ...(trimmedNote && { note: trimmedNote }),
  };
};
