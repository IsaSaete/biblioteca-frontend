import { getConfirmBookVariant } from "./confirmBookVariant";

describe("Given the confirmation of a book from the catalog to the library", () => {
  describe("When it is shown", () => {
    it("Then it has the cover, the pencil, the reading status and the details", () => {
      expect(getConfirmBookVariant(undefined, false)).toEqual({
        showsCover: true,
        canToggleEditing: true,
        extra: "status",
        showsDetails: true,
        submitsTo: "library",
      });
    });
  });
});

describe("Given the confirmation of a book added by hand to the library", () => {
  describe("When it is shown", () => {
    it("Then there is no cover and no pencil, because there is nothing to confirm", () => {
      expect(getConfirmBookVariant(undefined, true)).toEqual({
        showsCover: false,
        canToggleEditing: false,
        extra: "status",
        showsDetails: true,
        submitsTo: "library",
      });
    });
  });
});

describe("Given the confirmation of a book from the catalog for the wishlist", () => {
  describe("When it is shown", () => {
    it("Then it asks for a note, hides the details and cannot be edited", () => {
      expect(getConfirmBookVariant("wishlist", false)).toEqual({
        showsCover: true,
        canToggleEditing: false,
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
        canToggleEditing: false,
        extra: "note",
        showsDetails: true,
        submitsTo: "wishlist",
      });
    });
  });
});
