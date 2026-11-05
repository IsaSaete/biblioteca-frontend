import { formatLoanDate } from "./formatLoanDate";

describe("Given the date a book was lent", () => {
  const lentAt = "2026-11-03T12:00:00.000Z";

  describe("When it is from this year", () => {
    it("Then it shows the day and the month only", () => {
      expect(formatLoanDate(lentAt, new Date(2026, 11, 20))).toBe(
        "3 de noviembre",
      );
    });
  });

  describe("When it is from another year", () => {
    it("Then it also shows the year", () => {
      expect(formatLoanDate(lentAt, new Date(2027, 0, 5))).toBe(
        "3 de noviembre de 2026",
      );
    });
  });
});
