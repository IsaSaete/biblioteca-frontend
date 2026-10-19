import { parseApiError } from "./parseApiError";

// Mensaje general de un formulario cuando el error no es de un campo: el del
// backend si lo hay; si ni siquiera hubo respuesta (red, CORS), uno propio.
export const getFormErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  const apiError = parseApiError(error);

  if (apiError) {
    return apiError.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    error.status === "FETCH_ERROR"
  ) {
    return "No se pudo conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.";
  }

  return fallback;
};
