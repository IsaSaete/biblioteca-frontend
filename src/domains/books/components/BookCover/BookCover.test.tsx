import { fireEvent, render, screen } from "@testing-library/react";
import BookCover from "./BookCover";

describe("Given the cover of a book", () => {
  describe("When it has a cover URL", () => {
    it("Then it shows the image lazily loaded with an accessible name", () => {
      render(
        <BookCover
          title="Cien años de soledad"
          coverUrl="https://example.com/cover.jpg"
        />,
      );

      const image = screen.getByRole("img", {
        name: "Portada de Cien años de soledad",
      });
      expect(image).toHaveAttribute("src", "https://example.com/cover.jpg");
      expect(image).toHaveAttribute("loading", "lazy");
    });
  });

  describe("When the cover comes from a provider that offers a bigger size", () => {
    it("Then it asks for the bigger size so it is not pixelated", () => {
      render(
        <BookCover
          title="Cien años de soledad"
          coverUrl="https://covers.openlibrary.org/b/id/8231856-M.jpg"
        />,
      );

      expect(screen.getByRole("img")).toHaveAttribute(
        "src",
        "https://covers.openlibrary.org/b/id/8231856-L.jpg",
      );
    });

    it("Then, if the bigger size fails, it tries the original url before giving up", () => {
      render(
        <BookCover
          title="Cien años de soledad"
          coverUrl="https://covers.openlibrary.org/b/id/8231856-M.jpg"
        />,
      );

      fireEvent.error(screen.getByRole("img"));

      expect(screen.getByRole("img")).toHaveAttribute(
        "src",
        "https://covers.openlibrary.org/b/id/8231856-M.jpg",
      );

      fireEvent.error(screen.getByRole("img"));

      expect(screen.queryByRole("img")).not.toBeInTheDocument();
      expect(screen.getByTestId("cover-placeholder")).toBeInTheDocument();
    });
  });

  describe("When the cover is one of the first visible ones", () => {
    it("Then it is loaded eagerly with high priority instead of lazily", () => {
      render(
        <BookCover
          title="Cien años de soledad"
          coverUrl="https://books.google.com/cover.jpg"
          priority
        />,
      );

      const image = screen.getByRole("img");
      expect(image).toHaveAttribute("loading", "eager");
      expect(image).toHaveAttribute("fetchpriority", "high");
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
          coverUrl="https://example.com/broken.jpg"
        />,
      );

      fireEvent.error(screen.getByRole("img"));

      expect(screen.queryByRole("img")).not.toBeInTheDocument();
      expect(screen.getByTestId("cover-placeholder")).toBeInTheDocument();
    });
  });
});
