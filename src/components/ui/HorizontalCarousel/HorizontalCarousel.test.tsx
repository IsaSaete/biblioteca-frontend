import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HorizontalCarousel from "./HorizontalCarousel";

// jsdom no calcula el layout: se simulan las medidas de la fila. Las flechas
// solo se ven con ratón (CSS), por eso se buscan por su etiqueta.
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
    <HorizontalCarousel
      label="Añadidos recientemente"
      itemWidth={140}
      itemsPerPage={{ sm: 4, md: 5 }}
      mediaRatio={1.5}
    >
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

      await userEvent.click(await screen.findByLabelText("Ver siguientes"));

      expect(screen.queryByLabelText("Ver anteriores")).not.toBeInTheDocument();
      expect(scrollBy).toHaveBeenCalledWith(
        expect.objectContaining({ left: 360 }),
      );
    });
  });

  describe("When the cards can be measured", () => {
    it("Then the arrow moves a whole number of cards, so a page starts on a full card", async () => {
      const scrollBy = vi.fn();
      renderCarousel();
      const region = measureRow(
        { scrollWidth: 2000, clientWidth: 928 },
        scrollBy,
      );
      const [first, second] = screen.getAllByRole("listitem");
      // Cinco tarjetas de 176px con huecos de 12px caben justas en 928px.
      Object.defineProperty(first, "offsetLeft", { value: 0 });
      Object.defineProperty(first, "offsetWidth", { value: 176 });
      Object.defineProperty(second, "offsetLeft", { value: 188 });
      fireEvent.scroll(region);

      await userEvent.click(await screen.findByLabelText("Ver siguientes"));

      expect(scrollBy).toHaveBeenCalledWith(
        expect.objectContaining({ left: 940 }),
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
        await screen.findByLabelText("Ver anteriores"),
      ).toBeInTheDocument();
      expect(screen.queryByLabelText("Ver siguientes")).not.toBeInTheDocument();
    });
  });

  describe("When all the items fit in the row", () => {
    it("Then it shows no arrows", () => {
      renderCarousel();
      const region = measureRow({ scrollWidth: 300, clientWidth: 400 });
      fireEvent.scroll(region);

      expect(
        screen.queryByLabelText(/^Ver (anteriores|siguientes)$/),
      ).not.toBeInTheDocument();
    });
  });
});
