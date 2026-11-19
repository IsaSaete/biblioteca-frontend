import { coverImageUrl, isGoogleNotAvailable } from "./coverImageUrl";

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

describe('Given the check for the "image not available" picture of Google Books', () => {
  describe("When the enlarged cover has the proportion of that picture", () => {
    it.each([
      [575, 750],
      [300, 391],
    ])("Then %i x %i is not available", (width, height) => {
      expect(isGoogleNotAvailable(width, height, true)).toBe(true);
    });
  });

  describe("When the enlarged cover is a normal one", () => {
    it.each([
      [300, 464],
      [575, 889],
      [300, 424],
    ])("Then %i x %i is kept", (width, height) => {
      expect(isGoogleNotAvailable(width, height, true)).toBe(false);
    });
  });

  describe("When the original cover is checked", () => {
    it("Then only the exact size of the empty record is discarded", () => {
      expect(isGoogleNotAvailable(128, 170, false)).toBe(true);
      expect(isGoogleNotAvailable(128, 192, false)).toBe(false);
      // La proporción 23:30 sola no basta en la original: podría ser real.
      expect(isGoogleNotAvailable(128, 167, false)).toBe(false);
    });
  });

  describe("When the image has not loaded yet and has no size", () => {
    it("Then it is not considered unavailable", () => {
      expect(isGoogleNotAvailable(0, 0, true)).toBe(false);
    });
  });
});
