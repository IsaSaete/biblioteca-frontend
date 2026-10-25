import { getQuotesSortOptions, parseQuotesSort } from "./quotesSort";

describe("Given the order of the quotes", () => {
  describe("When no book is chosen", () => {
    it("Then it offers the three orders", () => {
      const options = getQuotesSortOptions(false);

      expect(options.map((option) => option.value)).toEqual([
        "recent",
        "oldest",
        "book",
        "book_desc",
      ]);
    });
  });

  describe("When a book is chosen", () => {
    it("Then it does not offer to group by book", () => {
      const options = getQuotesSortOptions(true);

      expect(options.map((option) => option.value)).toEqual([
        "recent",
        "oldest",
      ]);
    });
  });

  describe("When the URL has an order", () => {
    it.each([
      ["oldest", false, "oldest"],
      ["book", false, "book"],
      ["book_desc", false, "book_desc"],
      ["book_desc", true, "recent"],
      ["book", true, "recent"],
      ["random", false, "recent"],
      [null, false, "recent"],
    ])("Then %s (filtered: %s) gives %s", (value, filtered, expected) => {
      const sort = parseQuotesSort(value, filtered);

      expect(sort).toBe(expected);
    });
  });
});
