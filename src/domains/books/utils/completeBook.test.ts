import type { ExternalBook } from "../dto/ExternalBook";
import { completeBook, needsCompletion } from "./completeBook";

const searchResult: ExternalBook = {
  isbn: "9788437604947",
  title: "Rayuela",
  authors: ["Julio Cortázar"],
};

describe("Given a search result", () => {
  describe("When it has an ISBN but no publisher", () => {
    it("Then it needs to be completed", () => {
      expect(needsCompletion(searchResult)).toBe(true);
    });
  });

  describe("When it has an ISBN but no authors", () => {
    it("Then it needs to be completed", () => {
      expect(
        needsCompletion({ ...searchResult, publisher: "Cátedra", authors: [] }),
      ).toBe(true);
    });
  });

  describe("When it has publisher and authors", () => {
    it("Then it does not need to be completed", () => {
      expect(needsCompletion({ ...searchResult, publisher: "Cátedra" })).toBe(
        false,
      );
    });
  });

  describe("When it has no ISBN", () => {
    it("Then it cannot be completed", () => {
      expect(needsCompletion({ title: "Rayuela", authors: [] })).toBe(false);
    });
  });
});

describe("Given a search result and the book found by its ISBN", () => {
  describe("When the found book has the missing data", () => {
    it("Then the result is completed without overwriting what it had", () => {
      const completed = completeBook(searchResult, {
        isbn: "9788437604947",
        title: "Otro título",
        authors: ["Otro autor"],
        publisher: "Cátedra",
        publishedYear: 2013,
        pageCount: 600,
      });

      expect(completed).toEqual({
        ...searchResult,
        publisher: "Cátedra",
        publishedYear: 2013,
        pageCount: 600,
      });
    });
  });

  describe("When the result has no authors and the found book has them", () => {
    it("Then the authors are completed", () => {
      const completed = completeBook(
        { ...searchResult, authors: [] },
        { ...searchResult, authors: ["Julio Cortázar"] },
      );

      expect(completed.authors).toEqual(["Julio Cortázar"]);
    });
  });

  describe("When the result has no cover and the found book has one", () => {
    it("Then the cover and its source come together", () => {
      const completed = completeBook(searchResult, {
        ...searchResult,
        coverUrl: "https://covers.openlibrary.org/b/id/1-M.jpg",
        coverSource: "open_library",
      });

      expect(completed.coverUrl).toBe(
        "https://covers.openlibrary.org/b/id/1-M.jpg",
      );
      expect(completed.coverSource).toBe("open_library");
    });
  });

  describe("When the found book has nothing new", () => {
    it("Then the result stays as it was", () => {
      expect(completeBook(searchResult, searchResult)).toEqual(searchResult);
    });
  });
});
