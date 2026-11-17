import { getFormErrorMessage } from "../../../auth/utils/getFormErrorMessage";
import { parseApiError } from "../../../auth/utils/parseApiError";
import { isConfirmBookField } from "./confirmBookFields";
import type { ConfirmBookField } from "./confirmBookFields";

// Qué hay que enseñar cuando falla un alta: un mensaje general o el error de un
// campo concreto (que obliga a abrir lo que lo contiene).
export type SaveFailure =
  | { kind: "message"; message: string }
  | { kind: "field"; field: ConfirmBookField; message: string };

// Traduce el error de la API (alta en la biblioteca o en la lista de deseos) a
// lo que ve la persona.
export const describeSaveError = (error: unknown): SaveFailure => {
  const apiError = parseApiError(error);

  if (apiError?.code === "BOOK_ALREADY_IN_LIBRARY") {
    return { kind: "message", message: "Este libro ya está en tu biblioteca." };
  }

  if (apiError?.code === "BOOK_ALREADY_IN_WISHLIST") {
    return {
      kind: "message",
      message: "Este libro ya está en tu lista de deseos.",
    };
  }

  if (
    apiError?.code === "VALIDATION_ERROR" &&
    apiError.field !== undefined &&
    isConfirmBookField(apiError.field)
  ) {
    return { kind: "field", field: apiError.field, message: apiError.message };
  }

  return {
    kind: "message",
    message: getFormErrorMessage(
      error,
      "No se pudo guardar el libro. Inténtalo de nuevo.",
    ),
  };
};
