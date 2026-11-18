import { ThemeProvider } from "@mui/material/styles";
import { render, screen } from "@testing-library/react";
import theme from "../../theme/theme";
import AppLoading from "./AppLoading";

describe("Given the screen shown while the first screen is being downloaded", () => {
  describe("When it is shown", () => {
    it("Then it tells assistive technology that it is loading and shows the brand instead of a blank page", () => {
      render(
        <ThemeProvider theme={theme}>
          <AppLoading />
        </ThemeProvider>,
      );

      const status = screen.getByRole("status", { name: "Cargando" });
      expect(status).toHaveTextContent("Glosa");
    });
  });
});
