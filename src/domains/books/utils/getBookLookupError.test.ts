import { getBookLookupError } from "./getBookLookupError";

const apiError = (status: number, code: string) => ({
  status,
  data: { error: { code, message: "mensaje del backend" } },
});

describe("Given an error from looking up a book", () => {
  describe("When the ISBN is invalid", () => {
    it("Then the message belongs to the ISBN field", () => {
      expect(getBookLookupError(apiError(400, "INVALID_ISBN"))).toEqual({
        message: "El ISBN no es válido. Revisa que esté bien escrito.",
        field: "isbn",
      });
    });
  });

  describe("When no provider knows the ISBN", () => {
    it("Then it says no book was found", () => {
      expect(getBookLookupError(apiError(404, "ISBN_NOT_FOUND")).message).toBe(
        "No hemos encontrado ningún libro con ese ISBN.",
      );
    });
  });

  describe("When the providers fail", () => {
    it("Then it uses its own text, not the backend's provisional one", () => {
      const { message } = getBookLookupError(
        apiError(502, "BOOK_PROVIDER_UNAVAILABLE"),
      );

      expect(message).not.toContain("mensaje del backend");
      expect(message).toContain("catálogos de libros");
    });
  });

  describe("When the rate limit is exceeded", () => {
    it("Then it asks to wait a minute", () => {
      expect(getBookLookupError(apiError(429, "RATE_LIMITED")).message).toBe(
        "Has hecho muchas consultas seguidas. Espera un minuto y vuelve a intentarlo.",
      );
    });
  });

  describe("When there is no response at all", () => {
    it("Then it points to the connection", () => {
      expect(
        getBookLookupError({ status: "FETCH_ERROR", error: "x" }).message,
      ).toContain("conexión");
    });
  });

  describe("When the error is unknown", () => {
    it("Then it shows a generic message", () => {
      expect(getBookLookupError(apiError(500, "INTERNAL")).message).toContain(
        "No hemos podido buscar el libro",
      );
    });
  });
});
