import type { LibraryBook } from "../dto/LibraryBook";
import { buildOverridesRequest } from "./buildOverridesRequest";
import type { BookDataFormValues } from "./editBookSchema";

const book: LibraryBook = {
  id: "book-1",
  title: "El mundo amarillo",
  authors: ["Albert Espinosa"],
  publisher: "Debolsillo",
  publishedYear: 2012,
  pageCount: 170,
  language: "es",
  synopsis: "Una historia real.",
  categories: ["Biografía"],
  ejemplarId: "ejemplar-1",
  status: "pending",
  favorite: false,
};

const unchanged: BookDataFormValues = {
  title: "El mundo amarillo",
  authors: "Albert Espinosa",
  publisher: "Debolsillo",
  publishedYear: "2012",
  pageCount: "170",
  language: "es",
  synopsis: "Una historia real.",
  categories: "Biografía",
};

describe("Given the edit book form values", () => {
  describe("When nothing changed", () => {
    it("Then there is nothing to send", () => {
      expect(buildOverridesRequest(book, unchanged)).toBeUndefined();
    });
  });

  describe("When some fields changed", () => {
    it("Then only those fields are sent, parsed", () => {
      const overrides = buildOverridesRequest(book, {
        ...unchanged,
        title: "  Otro título ",
        authors: "Autora Uno, Autor Dos",
        publishedYear: "2020",
        categories: "Memorias, Salud",
      });

      expect(overrides).toEqual({
        title: "Otro título",
        authors: ["Autora Uno", "Autor Dos"],
        publishedYear: 2020,
        categories: ["Memorias", "Salud"],
      });
    });
  });

  describe("When an optional field that had a value is emptied", () => {
    it("Then it is sent as null to drop the correction", () => {
      const overrides = buildOverridesRequest(book, {
        ...unchanged,
        publishedYear: "",
        pageCount: "",
        language: "",
        synopsis: "",
        categories: "",
      });

      expect(overrides).toEqual({
        publishedYear: null,
        pageCount: null,
        language: null,
        synopsis: null,
        categories: null,
      });
    });
  });

  describe("When an optional field was already empty and stays empty", () => {
    it("Then it is not sent", () => {
      const bare: LibraryBook = {
        ...book,
        publishedYear: undefined,
        language: undefined,
        categories: undefined,
      };

      const overrides = buildOverridesRequest(bare, {
        ...unchanged,
        publishedYear: "",
        language: "",
        categories: "",
      });

      expect(overrides).toBeUndefined();
    });
  });
});
