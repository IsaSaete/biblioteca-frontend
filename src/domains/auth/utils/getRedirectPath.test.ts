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
    it("Then the home screen is returned", () => {
      const state = null;

      const result = getRedirectPath(state);

      expect(result).toBe("/home");
    });
  });

  describe("When the path points to another site", () => {
    it.each(["https://evil.example", "//evil.example"])(
      "Then the home screen is returned for %s",
      (from) => {
        const state = { from };

        const result = getRedirectPath(state);

        expect(result).toBe("/home");
      },
    );
  });
});
