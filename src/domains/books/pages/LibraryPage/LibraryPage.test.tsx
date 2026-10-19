import { render, screen } from "@testing-library/react";
import LibraryPage from "./LibraryPage";

describe("Given a user without books", () => {
  describe("When the library page is shown", () => {
    it("Then it explains that the shelf is empty under a library heading", () => {
      render(<LibraryPage />);

      expect(
        screen.getByRole("heading", { level: 1, name: "Biblioteca" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", {
          name: "Tu estantería está vacía, de momento",
        }),
      ).toBeInTheDocument();
    });

    it("Then it does not offer actions that are not implemented yet", () => {
      render(<LibraryPage />);

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });
  });
});
