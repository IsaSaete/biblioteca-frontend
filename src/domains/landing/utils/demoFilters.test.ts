import { demoBooks, demoTags } from "../content/demoLibrary";
import {
  countBooks,
  countWithTag,
  describeSelection,
  hasDemoFilters,
  matchesSelection,
  NO_DEMO_FILTERS,
} from "./demoFilters";
import type { DemoSelection } from "./demoFilters";

const titles = (selection: Partial<DemoSelection>) =>
  demoBooks
    .filter((book) =>
      matchesSelection(book, { ...NO_DEMO_FILTERS, ...selection }),
    )
    .map((book) => book.title);

describe("Given the demo library of the landing", () => {
  describe("When no filter is applied", () => {
    it("Then every book matches and no filter is reported", () => {
      expect(titles({})).toHaveLength(9);
      expect(hasDemoFilters(NO_DEMO_FILTERS)).toBe(false);
    });
  });

  describe("When Favoritos is on", () => {
    it("Then only the favorite books match", () => {
      expect(titles({ favorite: true })).toEqual([
        "1984",
        "La mujer habitada",
        "Una habitación propia",
        "Por favor, mátame",
      ]);
    });
  });

  describe("When Prestados is on", () => {
    it("Then only the lent books match", () => {
      expect(titles({ lent: true })).toEqual(["Un mundo feliz", "Cara de pan"]);
    });
  });

  describe("When a tag is chosen", () => {
    it("Then only the books with that tag match", () => {
      expect(titles({ tag: "musica" })).toEqual([
        "Energy Flash",
        "Por favor, mátame",
      ]);
    });
  });

  describe("When a switch and a tag are combined", () => {
    it("Then the books must meet both", () => {
      expect(titles({ lent: true, tag: "club" })).toEqual([
        "Un mundo feliz",
        "Cara de pan",
      ]);
      expect(titles({ favorite: true, tag: "club" })).toEqual([
        "La mujer habitada",
      ]);
      expect(titles({ favorite: true, lent: true })).toEqual([]);
    });
  });
});

describe("Given every filter offered by the demo", () => {
  describe("When it is applied", () => {
    it.each(demoTags.map(({ id }) => id))(
      "Then the tag %s leaves at least two books to see",
      (tag) => {
        expect(titles({ tag }).length).toBeGreaterThanOrEqual(2);
      },
    );

    it("Then Favoritos and Prestados leave at least two books to see", () => {
      expect(titles({ favorite: true }).length).toBeGreaterThanOrEqual(2);
      expect(titles({ lent: true }).length).toBeGreaterThanOrEqual(2);
    });
  });
});

describe("Given the tags of the demo", () => {
  describe("When their books are counted", () => {
    it("Then the number matches the books that carry the tag", () => {
      expect(countWithTag(demoBooks, "club")).toBe(3);
      expect(countWithTag(demoBooks, "musica")).toBe(2);
      expect(countWithTag(demoBooks, "heredados")).toBe(4);
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

describe("Given a selection of filters", () => {
  describe("When it is described for a screen reader", () => {
    it("Then it names what is chosen", () => {
      expect(describeSelection(NO_DEMO_FILTERS)).toBe("todos los libros");
      expect(describeSelection({ ...NO_DEMO_FILTERS, favorite: true })).toBe(
        "los favoritos",
      );
      expect(
        describeSelection({ favorite: true, lent: false, tag: "musica" }),
      ).toBe("los favoritos y los de la etiqueta música");
      expect(
        describeSelection({ favorite: true, lent: true, tag: "club" }),
      ).toBe(
        "los favoritos, los prestados y los de la etiqueta club de lectura",
      );
    });
  });
});
