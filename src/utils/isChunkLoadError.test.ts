import { isChunkLoadError } from "./isChunkLoadError";

describe("Given an error thrown while the web loads a screen", () => {
  describe("When it is the error that each browser gives for a file that no longer exists", () => {
    it.each([
      [
        "Chrome",
        "Failed to fetch dynamically imported module: https://glosaapp.com/assets/Home-abc123.js",
      ],
      [
        "Firefox",
        "error loading dynamically imported module: https://glosaapp.com/assets/Home-abc123.js",
      ],
      ["Safari", "Importing a module script failed."],
    ])("Then %s is recognised as an outdated version", (_browser, message) => {
      expect(isChunkLoadError(new TypeError(message))).toBe(true);
    });

    it("Then an error named ChunkLoadError is recognised too", () => {
      const error = new Error("boom");
      error.name = "ChunkLoadError";

      expect(isChunkLoadError(error)).toBe(true);
    });
  });

  describe("When it is any other error", () => {
    it("Then it is not taken for an outdated version", () => {
      expect(
        isChunkLoadError(new Error("Cannot read properties of undefined")),
      ).toBe(false);
      expect(isChunkLoadError(new TypeError("x is not a function"))).toBe(
        false,
      );
    });

    it("Then values that are not errors are never taken for one", () => {
      expect(isChunkLoadError(null)).toBe(false);
      expect(isChunkLoadError(undefined)).toBe(false);
      expect(
        isChunkLoadError("Failed to fetch dynamically imported module"),
      ).toBe(false);
      expect(isChunkLoadError({ status: 404 })).toBe(false);
    });
  });
});
