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

  describe('When Google Books has no cover in the bigger size and answers with its "image not available" picture', () => {
    const googleUrl =
      "https://books.google.com/books/content?id=abc&printsec=frontcover&img=1&zoom=1&edge=curl";

    const loadWithSize = (
      image: HTMLElement,
      width: number,
      height: number,
    ) => {
      Object.defineProperty(image, "naturalWidth", {
        value: width,
        configurable: true,
      });
      Object.defineProperty(image, "naturalHeight", {
        value: height,
        configurable: true,
      });
      fireEvent.load(image);
    };

    it("Then it goes back to the original url, which does have the cover", () => {
      render(<BookCover title="Cien años de soledad" coverUrl={googleUrl} />);

      loadWithSize(screen.getByRole("img"), 575, 750);

      expect(screen.getByRole("img")).toHaveAttribute("src", googleUrl);
    });

    it("Then the 300 x 391 picture Google gives for records with only a small cover also goes back to the original", () => {
      render(<BookCover title="Poema del Cante Jondo" coverUrl={googleUrl} />);

      loadWithSize(screen.getByRole("img"), 300, 391);

      expect(screen.getByRole("img")).toHaveAttribute("src", googleUrl);
    });

    it("Then, if the original is also the empty picture, it shows the Glosa bookmark and never that picture", () => {
      render(<BookCover title="Poema del Cante Jondo" coverUrl={googleUrl} />);

      loadWithSize(screen.getByRole("img"), 300, 391);
      loadWithSize(screen.getByRole("img"), 128, 170);

      expect(screen.queryByRole("img")).not.toBeInTheDocument();
      expect(screen.getByTestId("cover-placeholder")).toBeInTheDocument();
    });

    it("Then a normal bigger cover is kept", () => {
      render(<BookCover title="Cien años de soledad" coverUrl={googleUrl} />);

      loadWithSize(screen.getByRole("img"), 300, 464);

      expect(screen.getByRole("img")).toHaveAttribute(
        "src",
        expect.stringContaining("zoom=2"),
      );
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
