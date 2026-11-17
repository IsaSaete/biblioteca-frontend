import { getSectionsToReveal } from "./revealFields";

describe("Given the fields that failed validation", () => {
  describe("When a required field failed", () => {
    it("Then the editing of the data is opened", () => {
      expect(getSectionsToReveal(["publisher"])).toEqual({
        editing: true,
        details: false,
      });
    });
  });

  describe("When an optional detail failed", () => {
    it("Then the details are expanded", () => {
      expect(getSectionsToReveal(["pageCount"])).toEqual({
        editing: false,
        details: true,
      });
    });
  });

  describe("When both kinds failed", () => {
    it("Then both are opened", () => {
      expect(getSectionsToReveal(["title", "publishedYear"])).toEqual({
        editing: true,
        details: true,
      });
    });
  });

  describe("When nothing failed", () => {
    it("Then nothing is opened", () => {
      expect(getSectionsToReveal([])).toEqual({
        editing: false,
        details: false,
      });
    });
  });
});
