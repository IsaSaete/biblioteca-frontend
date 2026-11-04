import { render } from "@testing-library/react";
import { useDocumentTitle } from "./useDocumentTitle";

const Screen = ({ title }: { title: string | undefined }) => {
  useDocumentTitle(title);

  return null;
};

describe("Given a screen that sets the tab title", () => {
  beforeEach(() => {
    document.title = "Glosa — Tu biblioteca personal";
  });

  describe("When it is shown", () => {
    it("Then the tab title is the screen name followed by the app name", () => {
      render(<Screen title="Biblioteca" />);

      expect(document.title).toBe("Biblioteca — Glosa");
    });
  });

  describe("When it is closed", () => {
    it("Then the previous tab title comes back", () => {
      const { unmount } = render(<Screen title="Biblioteca" />);

      unmount();

      expect(document.title).toBe("Glosa — Tu biblioteca personal");
    });
  });

  describe("When the title changes while it is shown", () => {
    it("Then the tab title follows it", () => {
      const { rerender } = render(<Screen title="Cargando" />);

      rerender(<Screen title="Rayuela" />);

      expect(document.title).toBe("Rayuela — Glosa");
    });
  });

  describe("When it has no title yet", () => {
    it("Then the tab title is left as it was", () => {
      render(<Screen title={undefined} />);

      expect(document.title).toBe("Glosa — Tu biblioteca personal");
    });
  });
});
