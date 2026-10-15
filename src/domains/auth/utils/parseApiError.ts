import type { ApiError } from "../dto/ApiError";

// El error de RTK Query trae el cuerpo de la respuesta como `unknown`.
export const parseApiError = (error: unknown): ApiError["error"] | null => {
  if (typeof error !== "object" || error === null || !("data" in error)) {
    return null;
  }

  const { data } = error;

  if (typeof data !== "object" || data === null || !("error" in data)) {
    return null;
  }

  const apiError = data.error;

  if (
    typeof apiError !== "object" ||
    apiError === null ||
    !("code" in apiError) ||
    typeof apiError.code !== "string" ||
    !("message" in apiError) ||
    typeof apiError.message !== "string"
  ) {
    return null;
  }

  return {
    code: apiError.code,
    message: apiError.message,
    field:
      "field" in apiError && typeof apiError.field === "string"
        ? apiError.field
        : undefined,
  };
};
