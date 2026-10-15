import { isPasswordValid, passwordRequirements } from "./passwordRequirements";

const metIds = (password: string) =>
  passwordRequirements
    .filter((requirement) => requirement.isMet(password))
    .map((requirement) => requirement.id);

describe("Given the password requirements", () => {
  describe("When a password is empty", () => {
    it("Then no requirement is met", () => {
      const password = "";

      const result = metIds(password);

      expect(result).toEqual([]);
    });
  });

  describe("When a password only has lowercase letters and is long enough", () => {
    it("Then only the length requirement is met", () => {
      const password = "abcdefgh";

      const result = metIds(password);

      expect(result).toEqual(["length"]);
    });
  });

  describe("When a password has an uppercase letter, a number and a symbol but is short", () => {
    it("Then every requirement except length is met", () => {
      const password = "Ab1!";

      const result = metIds(password);

      expect(result).toEqual(["uppercase", "number", "symbol"]);
    });
  });

  describe("When a password meets all the requirements", () => {
    it("Then it is valid", () => {
      const password = "Secreta1!";

      const result = isPasswordValid(password);

      expect(result).toBe(true);
    });
  });

  describe("When a password misses one requirement", () => {
    it("Then it is not valid", () => {
      const password = "Secreta12";

      const result = isPasswordValid(password);

      expect(result).toBe(false);
    });
  });
});
