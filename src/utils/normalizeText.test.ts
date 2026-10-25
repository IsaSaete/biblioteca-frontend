import { normalizeText } from "./normalizeText";

describe("Given a text to compare", () => {
  describe("When it has capitals and accents", () => {
    it("Then it is lowercased and loses the accents", () => {
      const result = normalizeText("Ciencia Ficción");

      expect(result).toBe("ciencia ficcion");
    });
  });
});
