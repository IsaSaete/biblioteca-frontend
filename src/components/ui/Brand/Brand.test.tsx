import { ThemeProvider } from "@mui/material/styles";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import theme from "../../../theme/theme";
import Brand from "./Brand";

const renderBrand = (props: Parameters<typeof Brand>[0]) =>
  render(
    <MemoryRouter>
      <ThemeProvider theme={theme}>
        <Brand {...props} />
      </ThemeProvider>
    </MemoryRouter>,
  );

describe("Given the Glosa logotype", () => {
  describe("When it is shown with a link and its tagline", () => {
    it("Then it links to the landing and names the whole lockup", () => {
      renderBrand({ to: "/" });

      expect(
        screen.getByRole("link", { name: "Glosa, tu biblioteca personal" }),
      ).toHaveAttribute("href", "/");
    });
  });

  describe("When it is shown without the tagline", () => {
    it("Then only the name is read and the tagline is not on screen", () => {
      renderBrand({ to: "/", tagline: false });

      expect(screen.getByRole("link", { name: "Glosa" })).toBeInTheDocument();
      expect(
        screen.queryByText("Tu biblioteca personal"),
      ).not.toBeInTheDocument();
    });
  });

  describe("When it is shown without a link", () => {
    it("Then it is plain text, not a link", () => {
      renderBrand({ tagline: false });

      expect(screen.queryByRole("link")).not.toBeInTheDocument();
      expect(screen.getByText("Glosa")).toBeInTheDocument();
    });
  });
});
