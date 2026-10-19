import { readCookie } from "./readCookie";

describe("Given the cookies of the document", () => {
  describe("When the requested cookie exists among others", () => {
    it("Then its decoded value is returned", () => {
      document.cookie = "other=1";
      document.cookie = "csrfToken=abc%20123";

      const result = readCookie("csrfToken");

      expect(result).toBe("abc 123");
    });
  });

  describe("When the requested cookie does not exist", () => {
    it("Then undefined is returned", () => {
      const name = "missingCookie";

      const result = readCookie(name);

      expect(result).toBeUndefined();
    });
  });
});
