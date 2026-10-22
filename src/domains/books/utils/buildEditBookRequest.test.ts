import type { LibraryBook } from "../dto/LibraryBook";
import { buildEditBookRequest } from "./buildEditBookRequest";
import type { EditBookFormValues } from "./editBookSchema";

const book: LibraryBook = {
  id: "book-1",
  title: "El mundo amarillo",
  authors: ["Albert Espinosa"],
  publisher: "Debolsillo",
  ejemplarId: "ejemplar-1",
  status: "pending",
  favorite: false,
  location: "Salón",
  format: "pocket",
  notes: "Viejo",
  tags: ["clásicos"],
};

const unchanged: EditBookFormValues = {
  title: "El mundo amarillo",
  authors: "Albert Espinosa",
  publisher: "Debolsillo",
  publishedYear: "",
  pageCount: "",
  language: "",
  synopsis: "",
  categories: "",
  location: "Salón",
  format: "pocket",
  provenance: "",
  acquisitionDate: "",
  notes: "Viejo",
  tags: ["clásicos"],
};

describe("Given the unified edit form values", () => {
  describe("When nothing changed", () => {
    it("Then there is nothing to send", () => {
      expect(buildEditBookRequest(book, unchanged)).toBeUndefined();
    });
  });

  describe("When book data and copy data changed", () => {
    it("Then both travel in the same request", () => {
      const changes = buildEditBookRequest(book, {
        ...unchanged,
        title: "Mi título",
        provenance: "gift",
        tags: ["clásicos", "regalos"],
      });

      expect(changes).toEqual({
        overrides: { title: "Mi título" },
        provenance: "gift",
        tags: ["clásicos", "regalos"],
      });
    });
  });

  describe("When the copy data is emptied", () => {
    it("Then those fields are sent as null and the tags as an empty list", () => {
      const changes = buildEditBookRequest(book, {
        ...unchanged,
        location: "",
        format: "",
        notes: "",
        tags: [],
      });

      expect(changes).toEqual({
        location: null,
        format: null,
        notes: null,
        tags: [],
      });
    });
  });
});
