import script from "../../public/theme-init.js?raw";

const runInitScript = () => {
  new Function(script)();
};

const mockSystemPrefersDark = (prefersDark: boolean) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: prefersDark,
    media: query,
  }));
};

describe("Given the script that applies the saved theme before the first paint", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-light");
    document.documentElement.removeAttribute("data-dark");
  });

  describe("When the user chose the dark theme", () => {
    it("Then the document is marked as dark even if the system is light", () => {
      localStorage.setItem("mui-mode", "dark");
      mockSystemPrefersDark(false);

      runInitScript();

      expect(document.documentElement).toHaveAttribute("data-dark");
      expect(document.documentElement).not.toHaveAttribute("data-light");
    });
  });

  describe("When the user chose the light theme", () => {
    it("Then the document is marked as light even if the system is dark", () => {
      localStorage.setItem("mui-mode", "light");
      mockSystemPrefersDark(true);

      runInitScript();

      expect(document.documentElement).toHaveAttribute("data-light");
    });
  });

  describe("When nothing is saved and the system prefers dark", () => {
    it("Then it follows the system", () => {
      mockSystemPrefersDark(true);

      runInitScript();

      expect(document.documentElement).toHaveAttribute("data-dark");
    });
  });

  describe("When the storage is not available", () => {
    it("Then it does not throw", () => {
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("denied");
      });

      expect(runInitScript).not.toThrow();

      vi.restoreAllMocks();
    });
  });
});
