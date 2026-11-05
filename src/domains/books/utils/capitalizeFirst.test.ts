import {
  capitalizeFirst,
  capitalizeName,
  capitalizeWords,
} from "./capitalizeFirst";

describe("Given a text to show", () => {
  describe("When it starts with a lowercase letter", () => {
    it("Then the first letter is shown in uppercase and the rest is kept", () => {
      expect(capitalizeFirst("estantería del salón")).toBe(
        "Estantería del salón",
      );
    });
  });

  describe("When it is empty or already capitalized", () => {
    it("Then it does not change", () => {
      expect(capitalizeFirst("")).toBe("");
      expect(capitalizeFirst("Salón")).toBe("Salón");
    });
  });
});

describe("Given a tag to show", () => {
  describe("When it has several words", () => {
    it("Then every word starts in uppercase", () => {
      expect(capitalizeWords("ciencia ficción")).toBe("Ciencia Ficción");
    });
  });

  describe("When it has one word", () => {
    it("Then only that word is capitalized", () => {
      expect(capitalizeWords("clásicos")).toBe("Clásicos");
    });
  });
});

describe("Given the name of a borrower to show", () => {
  describe("When it is written in lowercase", () => {
    it("Then every word starts in uppercase", () => {
      expect(capitalizeName("maría lópez")).toBe("María López");
    });
  });

  describe("When it has particles in the middle", () => {
    it("Then the particles stay in lowercase", () => {
      expect(capitalizeName("juan de la cruz")).toBe("Juan de la Cruz");
      expect(capitalizeName("de la Fuente")).toBe("De la Fuente");
    });
  });

  describe("When it is already capitalized", () => {
    it("Then it does not change", () => {
      expect(capitalizeName("Ana María")).toBe("Ana María");
    });
  });
});
