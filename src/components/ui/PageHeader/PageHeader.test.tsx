import { render, screen } from "@testing-library/react";
import PageHeader from "./PageHeader";

describe("Given the header of a list page", () => {
  describe("When it has a count and an action", () => {
    it("Then it shows the title, the count and the action", () => {
      render(
        <PageHeader
          title="Citas"
          meta="34 citas · 12 libros"
          action={<button type="button">Añadir cita</button>}
        />,
      );

      expect(
        screen.getByRole("heading", { level: 1, name: "Citas" }),
      ).toBeInTheDocument();
      expect(screen.getByText("34 citas · 12 libros")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Añadir cita" }),
      ).toBeInTheDocument();
    });
  });

  describe("When it only has a title", () => {
    it("Then it shows no count", () => {
      render(<PageHeader title="Biblioteca" />);

      expect(
        screen.getByRole("heading", { level: 1, name: "Biblioteca" }),
      ).toBeInTheDocument();
    });
  });
});
