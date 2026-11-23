import { useAddToWishlistMutation } from "../../../wishlist/wishlistApi";
import { useCreateBookMutation } from "../../booksApi";
import type { BookStatus } from "../../dto/BookStatus";
import type { ExternalBook } from "../../dto/ExternalBook";
import { buildCreateBookRequest } from "../../utils/buildCreateBookRequest";
import type { ConfirmBookFormValues } from "../../utils/confirmBookSchema";
import { buildWishlistRequest } from "./buildWishlistRequest";
import { describeSaveError } from "./describeSaveError";
import type { SaveFailure } from "./describeSaveError";

// `bookId` solo lo hay al guardar en la biblioteca: la lista de deseos no tiene
// ficha a la que ir.
export type SaveResult =
  { ok: true; bookId?: string } | { ok: false; failure: SaveFailure };

// Los dos casos de uso de la confirmación (guardar en la biblioteca y añadir a
// la lista de deseos) detrás de una interfaz mínima. Es el único sitio que
// conoce la API: quien lo usa recibe un resultado, no mutaciones ni errores
// crudos, y puede cambiar sin saber cómo se guarda.
export const useBookSaver = (book: ExternalBook) => {
  const [createBook, { isLoading: isCreating }] = useCreateBookMutation();
  const [addToWishlist, { isLoading: isAdding }] = useAddToWishlistMutation();

  const toResult = (error: unknown): SaveResult =>
    error ? { ok: false, failure: describeSaveError(error) } : { ok: true };

  const saveToLibrary = async (
    values: ConfirmBookFormValues,
    status: BookStatus,
  ): Promise<SaveResult> => {
    const result = await createBook(
      buildCreateBookRequest(book, values, status),
    );

    return result.error
      ? { ok: false, failure: describeSaveError(result.error) }
      : { ok: true, bookId: result.data.id };
  };

  const saveToWishlist = async (
    values: ConfirmBookFormValues,
    note?: string,
  ): Promise<SaveResult> => {
    const result = await addToWishlist(
      buildWishlistRequest(book, values, note),
    );

    return toResult(result.error);
  };

  return { saveToLibrary, saveToWishlist, isCreating, isAdding };
};
