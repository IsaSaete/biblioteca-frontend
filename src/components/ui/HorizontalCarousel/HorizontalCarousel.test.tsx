import { render, screen } from "@testing-library/react";
import HorizontalCarousel from "./HorizontalCarousel";

describe("Given a horizontal carousel", () => {
  describe("When it renders its items", () => {
    it("Then it is a focusable named region with every item in a list", () => {
      render(
        <HorizontalCarousel label="Añadidos recientemente" itemWidth={140}>
          <li>Uno</li>
          <li>Dos</li>
        </HorizontalCarousel>,
      );

      const region = screen.getByRole("region", {
        name: "Añadidos recientemente",
      });

      expect(region).toHaveAttribute("tabindex", "0");
      expect(screen.getAllByRole("listitem")).toHaveLength(2);
    });
  });
});
