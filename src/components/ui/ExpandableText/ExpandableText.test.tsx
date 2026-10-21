import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ExpandableText from "./ExpandableText";

const mockOverflow = (isOverflowing: boolean) => {
  vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(
    isOverflowing ? 200 : 40,
  );
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(100);
};

afterEach(() => vi.restoreAllMocks());

describe("Given a long text folded to a few lines", () => {
  describe("When the text does not fit", () => {
    it("Then it offers to see more and then to see less", async () => {
      mockOverflow(true);
      render(<ExpandableText text="Una sinopsis muy larga" />);

      const more = screen.getByRole("button", { name: "Ver más" });
      expect(more).toHaveAttribute("aria-expanded", "false");

      await userEvent.click(more);
      const less = screen.getByRole("button", { name: "Ver menos" });

      expect(less).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("When the text fits in the visible lines", () => {
    it("Then there is no button", () => {
      mockOverflow(false);
      render(<ExpandableText text="Una sinopsis corta" />);

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });
});
