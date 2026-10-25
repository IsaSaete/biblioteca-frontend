import { formatQuotesMeta } from "./formatQuotesMeta";

describe("Given the count under the title of Citas", () => {
  describe("When the quotes are still loading", () => {
    it("Then there is nothing to show", () => {
      const meta = formatQuotesMeta({ total: undefined, bookCount: 3 });

      expect(meta).toBeUndefined();
    });
  });

  describe("When there are quotes from several books", () => {
    it("Then it counts quotes and books", () => {
      const meta = formatQuotesMeta({ total: 34, bookCount: 12 });

      expect(meta).toBe("34 citas · 12 libros");
    });
  });

  describe("When there is one quote from one book", () => {
    it("Then it uses the singular", () => {
      const meta = formatQuotesMeta({ total: 1, bookCount: 1 });

      expect(meta).toBe("1 cita · 1 libro");
    });
  });

  describe("When a book is chosen or no book has quotes", () => {
    it("Then it only counts the quotes", () => {
      expect(formatQuotesMeta({ total: 3 })).toBe("3 citas");
      expect(formatQuotesMeta({ total: 2, bookCount: 0 })).toBe("2 citas");
    });
  });
});
