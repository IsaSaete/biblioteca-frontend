import { suggestEmailFix } from "./suggestEmailFix";

describe("Given an email address typed in the sign-up form", () => {
  describe("When the domain has a common typo", () => {
    it.each([
      ["ana@gmial.com", "ana@gmail.com"],
      ["ana@gmail.con", "ana@gmail.com"],
      ["ana@gmail.co", "ana@gmail.com"],
      ["ana@gmai.com", "ana@gmail.com"],
      ["ana@hotmial.com", "ana@hotmail.com"],
      ["ana@hotmail.cmo", "ana@hotmail.com"],
      ["ana@yaho.es", "ana@yahoo.es"],
      ["ana@iclud.com", "ana@icloud.com"],
    ])("Then %s is corrected to %s", (typed, expected) => {
      expect(suggestEmailFix(typed)).toBe(expected);
    });

    it("Then the part before the @ is kept and the case is ignored", () => {
      expect(suggestEmailFix("  Ana.Lopez+libros@GMIAL.com ")).toBe(
        "ana.lopez+libros@gmail.com",
      );
    });
  });

  describe("When the domain is already a common one", () => {
    it("Then there is nothing to suggest", () => {
      expect(suggestEmailFix("ana@gmail.com")).toBeNull();
      expect(suggestEmailFix("ana@outlook.es")).toBeNull();
    });
  });

  describe("When the domain is real but different from the common ones", () => {
    it("Then it is left alone", () => {
      expect(suggestEmailFix("ana@yahoo.fr")).toBeNull();
      expect(suggestEmailFix("ana@miempresa.com")).toBeNull();
      expect(suggestEmailFix("ana@uoc.edu")).toBeNull();
    });
  });

  describe("When the address is not complete yet", () => {
    it("Then there is nothing to suggest", () => {
      expect(suggestEmailFix("")).toBeNull();
      expect(suggestEmailFix("ana")).toBeNull();
      expect(suggestEmailFix("ana@")).toBeNull();
      expect(suggestEmailFix("@gmial.com")).toBeNull();
    });
  });
});
