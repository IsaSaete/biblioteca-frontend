import type { Quote } from "../dto/Quote";
import { buildUpdateQuoteRequest } from "./buildUpdateQuoteRequest";

const quote: Quote = {
  id: "q1",
  ejemplarId: "ejemplar-1",
  text: "La guerra es la paz.",
  page: 9,
  createdAt: "2026-10-22T10:00:00.000Z",
  book: { id: "book-1", title: "1984", authors: ["George Orwell"] },
};

describe("Given the edit quote form values", () => {
  describe("When nothing changed", () => {
    it("Then there is nothing to send", () => {
      expect(
        buildUpdateQuoteRequest(quote, {
          text: " La guerra es la paz. ",
          page: "9",
        }),
      ).toBeUndefined();
    });
  });

  describe("When only the text changed", () => {
    it("Then only the trimmed text is sent", () => {
      expect(
        buildUpdateQuoteRequest(quote, { text: " Otra ", page: "9" }),
      ).toEqual({ text: "Otra" });
    });
  });

  describe("When the page is emptied", () => {
    it("Then the page is sent as null", () => {
      expect(
        buildUpdateQuoteRequest(quote, {
          text: "La guerra es la paz.",
          page: "",
        }),
      ).toEqual({ page: null });
    });
  });

  describe("When the quote had no page and none is written", () => {
    it("Then there is nothing to send", () => {
      expect(
        buildUpdateQuoteRequest(
          { ...quote, page: undefined },
          { text: "La guerra es la paz.", page: "" },
        ),
      ).toBeUndefined();
    });
  });
});
