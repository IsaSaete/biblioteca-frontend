import { render, screen } from "@testing-library/react";
import BookReference from "./BookReference";

describe("Given the reference of the book of a quote", () => {
  describe("When the book has one author", () => {
    it("Then the author is on top and the title below it in italics", () => {
      render(
        <BookReference
          title="Cien años de soledad"
          authors={["Gabriel García Márquez"]}
        />,
      );

      const author = screen.getByText("Gabriel García Márquez");
      const title = screen.getByText("Cien años de soledad");
      expect(title.tagName).toBe("EM");
      expect(
        author.compareDocumentPosition(title) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });
  });

  describe("When the book has several authors", () => {
    it("Then they are separated by commas on the same line", () => {
      render(
        <BookReference
          title="Good Omens"
          authors={["Terry Pratchett", "Neil Gaiman"]}
        />,
      );

      expect(
        screen.getByText("Terry Pratchett, Neil Gaiman"),
      ).toBeInTheDocument();
    });
  });

  describe("When the book has no author", () => {
    it("Then the title is still shown and the author line is kept", () => {
      const { container } = render(
        <BookReference title="Anónimo" authors={[]} />,
      );

      expect(screen.getByText("Anónimo")).toBeInTheDocument();
      expect(container.firstElementChild?.children).toHaveLength(2);
    });
  });
});
