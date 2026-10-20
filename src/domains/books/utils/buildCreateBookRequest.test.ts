import type { ExternalBook } from "../dto/ExternalBook";
import { buildCreateBookRequest } from "./buildCreateBookRequest";
import type { ConfirmBookFormValues } from "./confirmBookSchema";

const values: ConfirmBookFormValues = {
  title: " Cien años de soledad ",
  authors: "Gabriel García Márquez, , Otro Autor",
  publisher: "Cátedra",
  publishedYear: "1967",
  language: "es",
  pageCount: "471",
};

const book: ExternalBook = {
  isbn: "9788437604947",
  title: "Cien años",
  authors: ["GGM"],
  coverUrl: "https://books.google.com/cover.jpg",
  coverSource: "google_books",
  synopsis: "Macondo",
  categories: ["Ficción"],
};

describe("Given the confirmed data of a book", () => {
  describe("When the book comes from an ISBN lookup", () => {
    it("Then the corrected fields win and the untouched ones travel as they came", () => {
      const request = buildCreateBookRequest(book, values, "reading");

      expect(request).toEqual({
        isbn: "9788437604947",
        title: "Cien años de soledad",
        authors: ["Gabriel García Márquez", "Otro Autor"],
        publisher: "Cátedra",
        publishedYear: 1967,
        pageCount: 471,
        language: "es",
        coverUrl: "https://books.google.com/cover.jpg",
        coverSource: "google_books",
        synopsis: "Macondo",
        categories: ["Ficción"],
        status: "reading",
      });
    });
  });

  describe("When the optional fields are empty and there is no cover", () => {
    it("Then they are omitted instead of sent empty", () => {
      const request = buildCreateBookRequest(
        { title: "X", authors: ["Y"] },
        { ...values, publishedYear: "", language: "", pageCount: "" },
        "pending",
      );

      expect(request).toEqual({
        title: "Cien años de soledad",
        authors: ["Gabriel García Márquez", "Otro Autor"],
        publisher: "Cátedra",
        status: "pending",
      });
    });
  });

  describe("When the book has a cover URL but no source", () => {
    it("Then neither is sent", () => {
      const request = buildCreateBookRequest(
        {
          title: "X",
          authors: ["Y"],
          coverUrl: "https://books.google.com/c.jpg",
        },
        values,
        "pending",
      );

      expect(request).not.toHaveProperty("coverUrl");
      expect(request).not.toHaveProperty("coverSource");
    });
  });
});
