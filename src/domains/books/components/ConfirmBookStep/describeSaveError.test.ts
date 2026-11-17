import { describeSaveError } from "./describeSaveError";

const apiError = (code: string, message: string, field?: string) => ({
  status: 400,
  data: { error: { code, message, ...(field && { field }) } },
});

describe("Given an error returned when saving a book", () => {
  describe("When the book is already in the library", () => {
    it("Then it says so with a general message", () => {
      expect(
        describeSaveError(apiError("BOOK_ALREADY_IN_LIBRARY", "x")),
      ).toEqual({
        kind: "message",
        message: "Este libro ya está en tu biblioteca.",
      });
    });
  });

  describe("When the book is already in the wishlist", () => {
    it("Then it says so with a general message", () => {
      expect(
        describeSaveError(apiError("BOOK_ALREADY_IN_WISHLIST", "x")),
      ).toEqual({
        kind: "message",
        message: "Este libro ya está en tu lista de deseos.",
      });
    });
  });

  describe("When the server rejects one of the fields of the form", () => {
    it.each(["title", "authors", "publisher", "publishedYear", "pageCount"])(
      "Then the error is attached to %s",
      (field) => {
        expect(
          describeSaveError(apiError("VALIDATION_ERROR", "Mal", field)),
        ).toEqual({ kind: "field", field, message: "Mal" });
      },
    );
  });

  describe("When the server rejects a field that is not in the form", () => {
    it("Then it falls back to a general message from the server", () => {
      expect(
        describeSaveError(apiError("VALIDATION_ERROR", "Mal", "isbn")),
      ).toEqual({ kind: "message", message: "Mal" });
    });
  });

  describe("When the error is unknown and has no answer from the server", () => {
    it("Then it shows the generic message", () => {
      expect(describeSaveError(new Error("boom"))).toEqual({
        kind: "message",
        message: "No se pudo guardar el libro. Inténtalo de nuevo.",
      });
    });

    it("Then a connection failure says it could not reach the server", () => {
      expect(describeSaveError({ status: "FETCH_ERROR", error: "x" })).toEqual({
        kind: "message",
        message: expect.stringContaining("No se pudo conectar"),
      });
    });
  });
});
