import { getShowLabel } from "./getShowLabel";

describe("Given the label of the filters button", () => {
  describe.each([
    [undefined, "Ver libros"],
    [0, "Ningún libro coincide"],
    [1, "Ver 1 libro"],
    [12, "Ver 12 libros"],
  ])("When the count is %s", (total, expected) => {
    it(`Then it reads «${expected}»`, () => {
      const label = getShowLabel(total);

      expect(label).toBe(expected);
    });
  });
});
