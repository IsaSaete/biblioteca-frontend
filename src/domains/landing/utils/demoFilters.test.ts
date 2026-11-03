import { demoBooks } from "../content/demoLibrary";
import { countBooks, matchesFilter } from "./demoFilters";

const matching = (filter: Parameters<typeof matchesFilter>[1]) =>
  demoBooks.filter((book) => matchesFilter(book, filter));

describe("Given the demo library of the landing", () => {
  describe("When no filter is applied", () => {
    it("Then every book matches", () => {
      expect(matching("todos")).toHaveLength(9);
    });
  });

  describe("When a tag filter is applied", () => {
    it("Then only the books with that tag match", () => {
      expect(matching("favoritos").map((book) => book.title)).toEqual([
        "1984",
        "La mujer habitada",
        "Una habitación propia",
      ]);
      expect(matching("musica").map((book) => book.title)).toEqual([
        "Energy Flash",
        "Por favor, mátame",
      ]);
    });
  });
});

describe("Given every filter of the demo", () => {
  describe("When it is applied", () => {
    it.each(["favoritos", "club", "musica", "heredados"] as const)(
      "Then %s leaves at least two books to see",
      (filter) => {
        expect(matching(filter).length).toBeGreaterThanOrEqual(2);
      },
    );
  });
});

describe("Given a number of books", () => {
  describe("When it is written out", () => {
    it("Then it is singular for one and plural otherwise", () => {
      expect(countBooks(1)).toBe("1 libro");
      expect(countBooks(0)).toBe("0 libros");
      expect(countBooks(9)).toBe("9 libros");
    });
  });
});
