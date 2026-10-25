import {
  hasActiveFilters,
  parseLibraryFilters,
  toBooksParams,
  toSearchParams,
} from "./libraryFilters";

describe("Given the library filters in the URL", () => {
  describe("When the URL has no filters", () => {
    it("Then the default order is used, nothing is filtered and no params are sent", () => {
      const filters = parseLibraryFilters(new URLSearchParams());

      expect(filters).toEqual({
        sort: "recent",
        favorite: false,
        untagged: false,
        tag: undefined,
      });
      expect(hasActiveFilters(filters)).toBe(false);
      expect(toBooksParams(filters)).toBeUndefined();
      expect(toSearchParams(filters).toString()).toBe("");
    });
  });

  describe("When the URL has an order, a favorite filter and a tag", () => {
    it("Then they are read, sent to the API and written back to the URL", () => {
      const filters = parseLibraryFilters(
        new URLSearchParams("sort=alpha&favorite=true&tag=Poesía"),
      );

      expect(filters).toMatchObject({
        sort: "alpha",
        favorite: true,
        tag: "Poesía",
      });
      expect(hasActiveFilters(filters)).toBe(true);
      expect(toBooksParams(filters)).toEqual({
        sort: "alpha",
        favorite: true,
        tag: "Poesía",
      });
      expect(new URLSearchParams(toSearchParams(filters)).get("tag")).toBe(
        "Poesía",
      );
    });
  });

  describe("When the URL asks for any of the four orders", () => {
    it.each(["recent", "oldest", "alpha", "alpha_desc"])(
      "Then %s is kept",
      (sort) => {
        const filters = parseLibraryFilters(
          new URLSearchParams(`sort=${sort}`),
        );

        expect(filters.sort).toBe(sort);
      },
    );
  });

  describe("When the URL asks for an unknown order", () => {
    it("Then it falls back to the default order", () => {
      const filters = parseLibraryFilters(new URLSearchParams("sort=random"));

      expect(filters.sort).toBe("recent");
    });
  });

  describe("When the URL combines «Sin catalogar» with a tag", () => {
    it("Then only «Sin catalogar» is kept, as the contract does not combine them", () => {
      const filters = parseLibraryFilters(
        new URLSearchParams("untagged=true&tag=Poesía"),
      );

      expect(filters.untagged).toBe(true);
      expect(filters.tag).toBeUndefined();
      expect(toBooksParams(filters)).toEqual({ untagged: true });
    });
  });
});
