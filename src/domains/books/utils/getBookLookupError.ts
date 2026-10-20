import { parseApiError } from "../../auth/utils/parseApiError";

export interface BookLookupError {
  message: string;
  field?: "isbn";
  // Salida cuando el libro no se pudo traer: darlo de alta a mano.
  offersManualEntry?: boolean;
}

const genericMessage =
  "No hemos podido buscar el libro. Inténtalo de nuevo en un momento.";

// Textos propios del frontend (D-015): el `message` del backend es provisional.
export const getBookLookupError = (error: unknown): BookLookupError => {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    error.status === "FETCH_ERROR"
  ) {
    return {
      message:
        "No se pudo conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.",
    };
  }

  switch (parseApiError(error)?.code) {
    case "INVALID_ISBN":
      return {
        message: "El ISBN no es válido. Revisa que esté bien escrito.",
        field: "isbn",
      };
    case "ISBN_NOT_FOUND":
      return {
        message: "No hemos encontrado ningún libro con ese ISBN.",
        offersManualEntry: true,
      };
    case "BOOK_PROVIDER_UNAVAILABLE":
      return {
        message:
          "Ahora mismo no podemos consultar los catálogos de libros. Inténtalo de nuevo en unos minutos.",
        offersManualEntry: true,
      };
    case "RATE_LIMITED":
      return {
        message:
          "Has hecho muchas consultas seguidas. Espera un minuto y vuelve a intentarlo.",
      };
    default:
      return { message: genericMessage };
  }
};
