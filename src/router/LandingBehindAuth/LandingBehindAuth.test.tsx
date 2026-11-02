import { ThemeProvider } from "@mui/material/styles";
import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import LoginPage from "../../domains/auth/pages/LoginPage/LoginPage";
import RegisterPage from "../../domains/auth/pages/RegisterPage/RegisterPage";
import LandingPage from "../../domains/landing/pages/LandingPage/LandingPage";
import { renderRoutes } from "../../test/renderRoutes";
import { server } from "../../test/server";
import theme from "../../theme/theme";
import LandingBehindAuth from "./LandingBehindAuth";

const withTheme = (element: React.ReactNode) => (
  <ThemeProvider theme={theme}>{element}</ThemeProvider>
);

const renderAt = (path: string) => {
  server.use(
    http.get(`${import.meta.env.VITE_API_URL}/auth/me`, () =>
      HttpResponse.json(
        { error: { code: "AUTH_UNAUTHENTICATED", message: "Sin sesión" } },
        { status: 401 },
      ),
    ),
  );

  return renderRoutes(
    [
      { path: "/", element: withTheme(<LandingPage />) },
      {
        element: withTheme(<LandingBehindAuth />),
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/register", element: <RegisterPage /> },
        ],
      },
    ],
    [path],
  );
};

describe("Given the sign-in screens opened over the landing", () => {
  describe("When the visitor opens the login", () => {
    it("Then the landing stays behind the login dialog", async () => {
      renderAt("/login");

      expect(
        await screen.findByRole("dialog", { name: "Bienvenido" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", {
          level: 1,
          name: "Todos tus libros, a un toque.",
          hidden: true,
        }),
      ).toBeInTheDocument();
    });
  });

  describe("When the visitor closes the login", () => {
    it("Then they are back on the landing without the dialog", async () => {
      const { user, router } = renderAt("/login");

      await user.click(await screen.findByRole("button", { name: "Cerrar" }));

      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
      expect(router.state.location.pathname).toBe("/");
      expect(
        screen.getByRole("heading", {
          level: 1,
          name: "Todos tus libros, a un toque.",
        }),
      ).toBeInTheDocument();
    });
  });

  describe("When the visitor closes the sign-up", () => {
    it("Then they are back on the landing", async () => {
      const { user, router } = renderAt("/register");

      await user.click(await screen.findByRole("button", { name: "Cerrar" }));

      await waitFor(() => expect(router.state.location.pathname).toBe("/"));
    });
  });

  describe("When the visitor goes from the login to the sign-up", () => {
    it("Then the landing is still behind", async () => {
      const { user, router } = renderAt("/login");

      await user.click(await screen.findByRole("link", { name: "Regístrate" }));

      expect(router.state.location.pathname).toBe("/register");
      expect(
        screen.getByRole("heading", {
          level: 1,
          name: "Todos tus libros, a un toque.",
          hidden: true,
        }),
      ).toBeInTheDocument();
    });
  });
});
