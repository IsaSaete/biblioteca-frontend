import { getFormErrorMessage } from "./getFormErrorMessage";

const fallback = "Algo falló";

describe("Given an error returned by a request", () => {
  describe("When it carries an API error", () => {
    it("Then the message of the API is returned", () => {
      const error = {
        status: 429,
        data: {
          error: { code: "RATE_LIMITED", message: "Demasiados intentos" },
        },
      };

      const result = getFormErrorMessage(error, fallback);

      expect(result).toBe("Demasiados intentos");
    });
  });

  describe("When the request never got a response", () => {
    it("Then a connection message is returned", () => {
      const error = {
        status: "FETCH_ERROR",
        error: "TypeError: Failed to fetch",
      };

      const result = getFormErrorMessage(error, fallback);

      expect(result).toContain("No se pudo conectar con el servidor");
    });
  });

  describe("When the error has an unknown shape", () => {
    it("Then the fallback is returned", () => {
      const error = { status: 500, data: "Internal Server Error" };

      const result = getFormErrorMessage(error, fallback);

      expect(result).toBe(fallback);
    });
  });
});
