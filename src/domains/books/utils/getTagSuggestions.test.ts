import type { LibraryBook } from "../dto/LibraryBook";
import { getTagSuggestions } from "./getTagSuggestions";

const bookWith = (tags?: string[]): LibraryBook => ({
  id: "b",
  title: "Libro",
  authors: ["Autora"],
  publisher: "Editorial",
  ejemplarId: "e",
  status: "pending",
  favorite: false,
  tags,
});

describe("Given the books the user has loaded", () => {
  describe("When some tags are used more than others", () => {
    it("Then the suggestions go from most to least used", () => {
      const suggestions = getTagSuggestions([
        bookWith(["regalos", "clásicos"]),
        bookWith(["clásicos"]),
        bookWith(),
      ]);

      expect(suggestions).toEqual(["clásicos", "regalos"]);
    });
  });

  describe("When the same tag is written with different case", () => {
    it("Then it counts as one and keeps the first spelling", () => {
      const suggestions = getTagSuggestions([
        bookWith(["Sci-Fi"]),
        bookWith(["sci-fi"]),
      ]);

      expect(suggestions).toEqual(["Sci-Fi"]);
    });
  });
});
