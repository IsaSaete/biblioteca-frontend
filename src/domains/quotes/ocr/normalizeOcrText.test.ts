import { normalizeOcrText } from "./normalizeOcrText";

describe("Given the raw text read by the OCR", () => {
  describe("When a paragraph is split into one line per printed row", () => {
    it("Then the rows are joined with a space", () => {
      expect(
        normalizeOcrText(
          "Muchos años después,\nfrente al pelotón\nde fusilamiento",
        ),
      ).toBe("Muchos años después, frente al pelotón de fusilamiento");
    });
  });

  describe("When a word is split with a hyphen at the end of a row", () => {
    it("Then the word is put back together", () => {
      expect(normalizeOcrText("una palabra inter-\nnacional muy larga")).toBe(
        "una palabra internacional muy larga",
      );
    });

    it("Then the hyphen stays if the next row starts with a capital letter", () => {
      expect(normalizeOcrText("el pacto franco-\nBelga")).toBe(
        "el pacto franco- Belga",
      );
    });
  });

  describe("When there is a blank line between two paragraphs", () => {
    it("Then the paragraphs stay separated", () => {
      expect(normalizeOcrText("Primero\nuno\n\nSegundo\ndos")).toBe(
        "Primero uno\n\nSegundo dos",
      );
    });
  });

  describe("When the text has stray symbols and rows without letters", () => {
    it("Then they are dropped", () => {
      expect(normalizeOcrText("| Hola ~ mundo\n_ _ |\nadiós ^")).toBe(
        "Hola mundo adiós",
      );
    });
  });

  describe("When the text has extra spaces and Windows line endings", () => {
    it("Then they are normalised", () => {
      expect(normalizeOcrText("  uno   dos \r\n tres  ")).toBe("uno dos tres");
    });
  });

  describe("When nothing readable was found", () => {
    it("Then it returns an empty text", () => {
      expect(normalizeOcrText("  \n | ~ \n")).toBe("");
    });
  });
});
