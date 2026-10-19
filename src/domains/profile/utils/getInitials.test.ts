import { getInitials } from "./getInitials";

describe("Given the name of a user", () => {
  describe.each([
    ["Isa", "I"],
    ["Isabel Sáenz", "IS"],
    ["  ana   maría   gómez ", "AM"],
    ["", ""],
  ])("When the name is %p", (name, expected) => {
    it(`Then the initials are ${JSON.stringify(expected)}`, () => {
      const result = getInitials(name);

      expect(result).toBe(expected);
    });
  });
});
