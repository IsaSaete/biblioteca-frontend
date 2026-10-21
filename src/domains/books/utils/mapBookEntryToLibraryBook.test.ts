import type { BookEntry } from "../dto/BookEntry";
import { mapBookEntryToLibraryBook } from "./mapBookEntryToLibraryBook";

const buildEntry = (
  overrides?: BookEntry["ejemplar"]["overrides"],
): BookEntry => ({
  book: {
    id: "book-1",
    isbn: "9788437604947",
    title: "Cien años de soledad",
    authors: ["Gabriel García Márquez"],
    publisher: "Cátedra",
  },
  ejemplar: {
    id: "ejemplar-1",
    bookId: "book-1",
    status: "reading",
    favorite: false,
    overrides,
    createdAt: "2026-10-20T10:00:00.000Z",
  },
});

describe("Given a saved book with its ejemplar", () => {
  describe("When the ejemplar has no overrides", () => {
    it("Then it keeps the book data and adds the ejemplar id and status", () => {
      const libraryBook = mapBookEntryToLibraryBook(buildEntry());

      expect(libraryBook).toEqual({
        id: "book-1",
        isbn: "9788437604947",
        title: "Cien años de soledad",
        authors: ["Gabriel García Márquez"],
        publisher: "Cátedra",
        ejemplarId: "ejemplar-1",
        status: "reading",
        favorite: false,
      });
    });
  });

  describe("When the ejemplar has personal data", () => {
    it("Then the library book carries it", () => {
      const entry = buildEntry();
      const libraryBook = mapBookEntryToLibraryBook({
        ...entry,
        ejemplar: {
          ...entry.ejemplar,
          favorite: true,
          location: "Salón",
          format: "paperback",
          provenance: "gift",
          acquisitionDate: "2026-05-01",
          notes: "Dedicado",
          tags: ["clásicos"],
        },
      });

      expect(libraryBook).toMatchObject({
        favorite: true,
        location: "Salón",
        format: "paperback",
        provenance: "gift",
        acquisitionDate: "2026-05-01",
        notes: "Dedicado",
        tags: ["clásicos"],
      });
    });
  });

  describe("When the ejemplar overrides some fields", () => {
    it("Then the override wins and the rest comes from the book", () => {
      const libraryBook = mapBookEntryToLibraryBook(
        buildEntry({ title: "Cien años", publisher: "Alfaguara" }),
      );

      expect(libraryBook).toMatchObject({
        title: "Cien años",
        publisher: "Alfaguara",
        authors: ["Gabriel García Márquez"],
      });
    });
  });

  describe("When an override comes as null", () => {
    it("Then the book value is kept", () => {
      const entry = buildEntry();
      Object.assign(entry.ejemplar, { overrides: { title: null } });

      expect(mapBookEntryToLibraryBook(entry).title).toBe(
        "Cien años de soledad",
      );
    });
  });
});
