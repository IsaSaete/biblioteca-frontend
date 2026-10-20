import { fireEvent, render, screen } from "@testing-library/react";
import BookCover from "./BookCover";

describe("Given the cover of a book", () => {
  describe("When it has a cover URL", () => {
    it("Then it shows the image lazily loaded with an accessible name", () => {
      render(
        <BookCover
          title="Cien años de soledad"
          coverUrl="https://books.google.com/cover.jpg"
        />,
      );

      const image = screen.getByRole("img", {
        name: "Portada de Cien años de soledad",
      });
      expect(image).toHaveAttribute(
        "src",
        "https://books.google.com/cover.jpg",
      );
      expect(image).toHaveAttribute("loading", "lazy");
    });
  });

  describe("When it has no cover URL", () => {
    it("Then it shows the placeholder instead of an image", () => {
      render(<BookCover title="Cien años de soledad" />);

      expect(screen.queryByRole("img")).not.toBeInTheDocument();
      expect(screen.getByTestId("cover-placeholder")).toBeInTheDocument();
    });
  });

  describe("When the image fails to load", () => {
    it("Then it falls back to the placeholder", () => {
      render(
        <BookCover
          title="Cien años de soledad"
          coverUrl="https://books.google.com/broken.jpg"
        />,
      );

      fireEvent.error(screen.getByRole("img"));

      expect(screen.queryByRole("img")).not.toBeInTheDocument();
      expect(screen.getByTestId("cover-placeholder")).toBeInTheDocument();
    });
  });
});
