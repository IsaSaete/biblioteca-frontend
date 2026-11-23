import { formatLanguage } from "./formatLanguage";

describe("formatLanguage", () => {
  describe("Given a language code known by the browser", () => {
    it.each([
      ["es", "Español"],
      ["en", "Inglés"],
      ["eng", "Inglés"],
    ])("When it is %s, Then it shows %s", (code, expected) => {
      expect(formatLanguage(code)).toBe(expected);
    });
  });

  describe("Given free text of up to 3 letters that is not a known code", () => {
    it.each([
      ["esp", "ESP"],
      ["ing", "ING"],
    ])("When it is %s, Then it is uppercased as %s", (text, expected) => {
      expect(formatLanguage(text)).toBe(expected);
    });
  });

  describe("Given free text of more than 3 letters", () => {
    it.each([
      ["español", "Español"],
      ["inglés", "Inglés"],
      ["CATALÁN", "CATALÁN"],
    ])("When it is %s, Then it shows %s", (text, expected) => {
      expect(formatLanguage(text)).toBe(expected);
    });
  });

  describe("Given an empty or blank language", () => {
    it("When it is only spaces, Then it returns an empty text", () => {
      expect(formatLanguage("   ")).toBe("");
    });
  });
});
