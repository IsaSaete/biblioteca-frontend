import { buildCreateQuoteRequest } from "./buildCreateQuoteRequest";

describe("Given the add quote form values", () => {
  describe("When the page is filled", () => {
    it("Then it sends the trimmed text and the page as a number", () => {
      expect(
        buildCreateQuoteRequest("ejemplar-1", { text: "  Hola  ", page: "9" }),
      ).toEqual({
        ejemplarId: "ejemplar-1",
        text: "Hola",
        page: 9,
        origin: "manual",
      });
    });
  });

  describe("When the page is empty", () => {
    it("Then the request has no page", () => {
      expect(
        buildCreateQuoteRequest("ejemplar-1", { text: "Hola", page: "" }),
      ).toEqual({ ejemplarId: "ejemplar-1", text: "Hola", origin: "manual" });
    });
  });

  describe("When the text came from the camera", () => {
    it("Then the origin is ocr", () => {
      expect(
        buildCreateQuoteRequest(
          "ejemplar-1",
          { text: "Hola", page: "" },
          "ocr",
        ),
      ).toMatchObject({ origin: "ocr" });
    });
  });
});
