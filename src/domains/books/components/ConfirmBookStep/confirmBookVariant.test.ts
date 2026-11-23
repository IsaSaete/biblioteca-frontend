import { getConfirmBookVariant } from "./confirmBookVariant";

describe("Given the confirmation of a book from the catalog to the library", () => {
  describe("When it is shown", () => {
    it("Then it has the cover and the reading status, and the data can only be confirmed", () => {
      expect(getConfirmBookVariant(undefined, false)).toEqual({
        showsCover: true,
        extra: "status",
        showsDetails: false,
        submitsTo: "library",
      });
    });
  });
});

describe("Given the confirmation of a book added by hand to the library", () => {
  describe("When it is shown", () => {
    it("Then there is no cover and the details are open to fill in", () => {
      expect(getConfirmBookVariant(undefined, true)).toEqual({
        showsCover: false,
        extra: "status",
        showsDetails: true,
        submitsTo: "library",
      });
    });
  });
});

describe("Given the confirmation of a book from the catalog for the wishlist", () => {
  describe("When it is shown", () => {
    it("Then it asks for a note and hides the details", () => {
      expect(getConfirmBookVariant("wishlist", false)).toEqual({
        showsCover: true,
        extra: "note",
        showsDetails: false,
        submitsTo: "wishlist",
      });
    });
  });
});

describe("Given the confirmation of a book added by hand to the wishlist", () => {
  describe("When it is shown", () => {
    it("Then it keeps the details open to fill in, with a note and no cover", () => {
      expect(getConfirmBookVariant("wishlist", true)).toEqual({
        showsCover: false,
        extra: "note",
        showsDetails: true,
        submitsTo: "wishlist",
      });
    });
  });
});
