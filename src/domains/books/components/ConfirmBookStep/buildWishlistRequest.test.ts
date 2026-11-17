import type { ExternalBook } from "../../dto/ExternalBook";
import { buildWishlistRequest } from "./buildWishlistRequest";

const book: ExternalBook = {
  isbn: "9780451524935",
  title: "1984",
  authors: ["George Orwell"],
  publisher: "Debolsillo",
} as ExternalBook;

const values = {
  title: " 1984 ",
  authors: "George Orwell",
  publisher: "Debolsillo",
  publishedYear: "",
  language: "",
  pageCount: "",
};

describe("Given a book confirmed for the wishlist", () => {
  describe("When there is no note", () => {
    it("Then the request has the data of the book, no reading status and no note", () => {
      const request = buildWishlistRequest(book, values);

      expect(request).toMatchObject({
        isbn: "9780451524935",
        title: "1984",
        authors: ["George Orwell"],
      });
      expect(request).not.toHaveProperty("note");
      expect(request).not.toHaveProperty("status");
    });

    it("Then a note with only spaces counts as no note", () => {
      expect(buildWishlistRequest(book, values, "   ")).not.toHaveProperty(
        "note",
      );
    });
  });

  describe("When there is a note", () => {
    it("Then it is sent trimmed", () => {
      expect(buildWishlistRequest(book, values, "  regalo  ")).toMatchObject({
        note: "regalo",
      });
    });
  });
});
