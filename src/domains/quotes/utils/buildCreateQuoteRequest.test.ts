import { buildCreateQuoteRequest } from "./buildCreateQuoteRequest";

describe("Given the add quote form values", () => {
  describe("When the page is filled", () => {
    it("Then it sends the trimmed text and the page as a number", () => {
      expect(
        buildCreateQuoteRequest("ejemplar-1", {
          text: "  Hola  ",
          page: "9",
          source: "",
        }),
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
        buildCreateQuoteRequest("ejemplar-1", {
          text: "Hola",
          page: "",
          source: "",
        }),
      ).toEqual({ ejemplarId: "ejemplar-1", text: "Hola", origin: "manual" });
    });
  });

  describe("When the text came from the camera", () => {
    it("Then the origin is ocr", () => {
      expect(
        buildCreateQuoteRequest(
          "ejemplar-1",
          { text: "Hola", page: "", source: "" },
          "ocr",
        ),
      ).toMatchObject({ origin: "ocr" });
    });
  });

  describe("When the quote has no book", () => {
    it("Then it has no ejemplarId and carries the trimmed source", () => {
      expect(
        buildCreateQuoteRequest(undefined, {
          text: "Hola",
          page: "",
          source: "  Paper de Historia ",
        }),
      ).toEqual({
        text: "Hola",
        source: "Paper de Historia",
        origin: "manual",
      });
    });

    it("Then an empty source is not sent", () => {
      expect(
        buildCreateQuoteRequest(undefined, {
          text: "Hola",
          page: "",
          source: " ",
        }),
      ).toEqual({ text: "Hola", origin: "manual" });
    });
  });

  describe("When the quote has a book", () => {
    it("Then the source never travels", () => {
      expect(
        buildCreateQuoteRequest("ejemplar-1", {
          text: "Hola",
          page: "",
          source: "Paper",
        }),
      ).toEqual({ ejemplarId: "ejemplar-1", text: "Hola", origin: "manual" });
    });
  });
});
