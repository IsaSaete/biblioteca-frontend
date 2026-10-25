import { formatCount } from "./formatCount";

describe("Given a count with its noun", () => {
  describe.each([
    [0, "0 libros"],
    [1, "1 libro"],
    [12, "12 libros"],
  ])("When the count is %s", (count, expected) => {
    it(`Then it reads «${expected}»`, () => {
      const text = formatCount(count, "libro", "libros");

      expect(text).toBe(expected);
    });
  });
});
