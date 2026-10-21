import { extractIsbn } from "./extractIsbn";

describe("Given the barcodes detected in a camera frame", () => {
  describe("When one is a valid ISBN-13 (EAN-13 with the 978 prefix)", () => {
    it("Then it returns that ISBN", () => {
      expect(extractIsbn([{ rawValue: "9788437604947" }])).toBe(
        "9788437604947",
      );
    });
  });

  describe("When the frame also contains codes that are not an ISBN", () => {
    it("Then it skips them and returns the book's ISBN", () => {
      const barcodes = [
        { rawValue: "5449000000996" },
        { rawValue: "12345" },
        { rawValue: "9788437604947" },
      ];

      expect(extractIsbn(barcodes)).toBe("9788437604947");
    });
  });

  describe("When the ISBN-like code has a wrong check digit", () => {
    it("Then it is ignored, so a misread does not trigger a lookup", () => {
      expect(extractIsbn([{ rawValue: "9788437604948" }])).toBeNull();
    });
  });

  describe("When there are no barcodes", () => {
    it("Then it returns null", () => {
      expect(extractIsbn([])).toBeNull();
    });
  });
});
