import { getRedirectPath } from "./getRedirectPath";

describe("Given the navigation state after a redirect to login", () => {
  describe("When it contains an internal path", () => {
    it("Then that path is returned", () => {
      const state = { from: "/profile" };

      const result = getRedirectPath(state);

      expect(result).toBe("/profile");
    });
  });

  describe("When there is no state", () => {
    it("Then the library is returned", () => {
      const state = null;

      const result = getRedirectPath(state);

      expect(result).toBe("/library");
    });
  });

  describe("When the path points to another site", () => {
    it.each(["https://evil.example", "//evil.example"])(
      "Then the library is returned for %s",
      (from) => {
        const state = { from };

        const result = getRedirectPath(state);

        expect(result).toBe("/library");
      },
    );
  });
});
