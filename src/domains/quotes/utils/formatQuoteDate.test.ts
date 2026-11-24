import { formatQuoteDate } from "./formatQuoteDate";

describe("Given the date a quote was saved", () => {
  describe("When it is a valid date", () => {
    it("Then it is shown with the short month in Spanish", () => {
      expect(formatQuoteDate("2026-11-21T10:00:00.000Z")).toMatch(
        /^2[01] nov 2026$/,
      );
    });
  });

  describe("When it is not a valid date", () => {
    it("Then it is empty", () => {
      expect(formatQuoteDate("no es una fecha")).toBe("");
    });
  });
});
