import { coverImageUrl } from "./coverImageUrl";

describe("Given the cover image url helper", () => {
  describe("When the cover comes from Open Library in a small size", () => {
    it.each(["M", "S"])(
      "Then it asks for the large size instead of the %s one",
      (size) => {
        const result = coverImageUrl(
          `https://covers.openlibrary.org/b/id/8231856-${size}.jpg`,
        );

        expect(result).toBe(
          "https://covers.openlibrary.org/b/id/8231856-L.jpg",
        );
      },
    );
  });

  describe("When the cover comes from Google Books with the smallest zoom and the curled edge", () => {
    it("Then it asks for a bigger zoom, drops the curl and keeps the rest", () => {
      const result = coverImageUrl(
        "http://books.google.com/books/content?id=abc&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
      );

      expect(result).toBe(
        "https://books.google.com/books/content?id=abc&printsec=frontcover&img=1&zoom=2&source=gbs_api",
      );
    });

    it("Then it adds the zoom when the url has none", () => {
      const result = coverImageUrl(
        "https://books.google.com/books/content?id=abc&img=1",
      );

      expect(new URL(result).searchParams.get("zoom")).toBe("2");
    });
  });

  describe("When the url already asks for a bigger zoom", () => {
    it("Then it respects it", () => {
      const result = coverImageUrl(
        "https://books.google.com/books/content?id=abc&zoom=3",
      );

      expect(new URL(result).searchParams.get("zoom")).toBe("3");
    });
  });

  describe("When the cover comes from an unknown host or is not a valid url", () => {
    it.each([
      "https://example.com/cover-M.jpg",
      "not a url",
      "/relative/cover.jpg",
    ])("Then %s is returned untouched", (url) => {
      expect(coverImageUrl(url)).toBe(url);
    });
  });
});
