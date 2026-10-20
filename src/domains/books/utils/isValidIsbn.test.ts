import { isValidIsbn } from "./isValidIsbn";

describe("Given an ISBN typed by the user", () => {
  describe("When it is a valid ISBN-13", () => {
    it.each(["9788437604947", "978-84-376-0494-7", " 978 84 376 0494 7 "])(
      "Then %j is accepted",
      (isbn) => {
        expect(isValidIsbn(isbn)).toBe(true);
      },
    );
  });

  describe("When it is a valid ISBN-10", () => {
    it.each(["843760494X", "84-376-0494-x", "0-306-40615-2"])(
      "Then %j is accepted",
      (isbn) => {
        expect(isValidIsbn(isbn)).toBe(true);
      },
    );
  });

  describe("When the check digit is wrong", () => {
    it.each(["9788437604948", "8437604941"])("Then %j is rejected", (isbn) => {
      expect(isValidIsbn(isbn)).toBe(false);
    });
  });

  describe("When the format is wrong", () => {
    it.each([
      "",
      "abc",
      "12345",
      "97884376049",
      "97884376049471",
      "84376049X1",
    ])("Then %j is rejected", (isbn) => {
      expect(isValidIsbn(isbn)).toBe(false);
    });
  });
});
