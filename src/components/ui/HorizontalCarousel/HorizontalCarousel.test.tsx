import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HorizontalCarousel from "./HorizontalCarousel";

// jsdom no calcula el layout: se simulan las medidas de la fila. Las flechas
// solo se ven con ratón (CSS), por eso las consultas incluyen las ocultas.
const measureRow = (
  { scrollWidth, clientWidth }: { scrollWidth: number; clientWidth: number },
  scrollBy = vi.fn(),
) => {
  const region = screen.getByRole("region", { name: "Añadidos recientemente" });
  Object.defineProperty(region, "scrollWidth", { value: scrollWidth });
  Object.defineProperty(region, "clientWidth", { value: clientWidth });
  region.scrollBy = scrollBy;
  return region;
};

const renderCarousel = () =>
  render(
    <HorizontalCarousel label="Añadidos recientemente" itemWidth={140}>
      <li>Uno</li>
      <li>Dos</li>
    </HorizontalCarousel>,
  );

describe("Given a horizontal carousel", () => {
  describe("When it renders its items", () => {
    it("Then it is a focusable named region with every item in a list", () => {
      renderCarousel();

      const region = screen.getByRole("region", {
        name: "Añadidos recientemente",
      });

      expect(region).toHaveAttribute("tabindex", "0");
      expect(screen.getAllByRole("listitem")).toHaveLength(2);
    });
  });

  describe("When the items do not fit in the row", () => {
    it("Then it offers to see the next ones and scrolls a page on click", async () => {
      const scrollBy = vi.fn();
      renderCarousel();
      const region = measureRow(
        { scrollWidth: 1000, clientWidth: 400 },
        scrollBy,
      );
      fireEvent.scroll(region);

      const next = await screen.findByRole("button", {
        name: "Ver siguientes",
        hidden: true,
      });
      await userEvent.click(next);

      expect(
        screen.queryByRole("button", { name: "Ver anteriores", hidden: true }),
      ).not.toBeInTheDocument();
      expect(scrollBy).toHaveBeenCalledWith(
        expect.objectContaining({ left: 360 }),
      );
    });
  });

  describe("When the row has been scrolled to the end", () => {
    it("Then it only offers to go back", async () => {
      renderCarousel();
      const region = measureRow({ scrollWidth: 1000, clientWidth: 400 });
      Object.defineProperty(region, "scrollLeft", { value: 600 });
      fireEvent.scroll(region);

      expect(
        await screen.findByRole("button", {
          name: "Ver anteriores",
          hidden: true,
        }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Ver siguientes", hidden: true }),
      ).not.toBeInTheDocument();
    });
  });

  describe("When all the items fit in the row", () => {
    it("Then it shows no arrows", () => {
      renderCarousel();
      const region = measureRow({ scrollWidth: 300, clientWidth: 400 });
      fireEvent.scroll(region);

      expect(
        screen.queryByRole("button", { hidden: true }),
      ).not.toBeInTheDocument();
    });
  });
});
