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
        "Don Quijote",
        "Rimas",
      ]);
      expect(matching("ensayo")).toHaveLength(2);
    });
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
