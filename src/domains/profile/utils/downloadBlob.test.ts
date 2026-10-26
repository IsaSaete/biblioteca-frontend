import { downloadBlob } from "./downloadBlob";

describe("Given a file in memory", () => {
  describe("When it is downloaded", () => {
    it("Then a temporary link with its name is clicked and released", () => {
      const createObjectURL = vi.fn(() => "blob:datos");
      const revokeObjectURL = vi.fn();
      vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });
      const click = vi
        .spyOn(HTMLAnchorElement.prototype, "click")
        .mockImplementation(() => undefined);
      const blob = new Blob(["{}"], { type: "application/json" });

      downloadBlob(blob, "glosa-datos.json");

      expect(createObjectURL).toHaveBeenCalledWith(blob);
      expect(click).toHaveBeenCalledTimes(1);
      const [link] = click.mock.contexts;
      expect(link).toHaveProperty("download", "glosa-datos.json");
      expect(link).toHaveAttribute("href", "blob:datos");
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:datos");
      expect(document.querySelector("a[download]")).toBeNull();

      click.mockRestore();
      vi.unstubAllGlobals();
    });
  });
});
