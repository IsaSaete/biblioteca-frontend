import { ThemeProvider } from "@mui/material/styles";
import { screen, waitFor } from "@testing-library/react";
import { delay, http, HttpResponse } from "msw";
import theme from "../../../../theme/theme";
import { renderRoutes } from "../../../../test/renderRoutes";
import { server } from "../../../../test/server";
import LandingPage from "./LandingPage";

const meUrl = `${import.meta.env.VITE_API_URL}/auth/me`;
const session = {
  user: { id: "1", name: "Isa", email: "isa@example.com" },
};

const renderLanding = () =>
  renderRoutes(
    [
      {
        path: "/",
        element: (
          <ThemeProvider theme={theme}>
            <LandingPage />
          </ThemeProvider>
        ),
      },
      { path: "/home", element: <p>Pantalla de Home</p> },
      { path: "/login", element: <p>Acceso</p> },
      { path: "/register", element: <p>Registro</p> },
    ],
    ["/"],
  );

describe("Given the public landing page", () => {
  describe("When a visitor without a session arrives", () => {
    it("Then the landing is shown with the way to sign up and to sign in", async () => {
      server.use(
        http.get(meUrl, () =>
          HttpResponse.json(
            { error: { code: "AUTH_UNAUTHENTICATED", message: "Sin sesión" } },
            { status: 401 },
          ),
        ),
      );

      renderLanding();

      expect(
        screen.getByRole("heading", {
          level: 1,
          name: "Todos tus libros, a un toque.",
        }),
      ).toBeInTheDocument();
      expect(
        screen.getAllByRole("link", { name: "Crear cuenta" })[0],
      ).toHaveAttribute("href", "/register");
      expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute(
        "href",
        "/login",
      );
      expect(
        screen.getByRole("img", { name: /estantería con libros/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Gratis, sin anuncios y sin tarjeta."),
      ).toBeVisible();
    });
  });

  describe("When the session check is slow", () => {
    it("Then the landing is already on screen without waiting for it", async () => {
      server.use(
        http.get(meUrl, async () => {
          await delay("infinite");
          return HttpResponse.json(session);
        }),
      );

      renderLanding();

      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(screen.queryByText("Pantalla de Home")).not.toBeInTheDocument();
    });
  });

  describe("When the session check fails", () => {
    it("Then the landing stays", async () => {
      server.use(http.get(meUrl, () => HttpResponse.error()));

      renderLanding();

      await waitFor(() =>
        expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument(),
      );
      expect(screen.queryByText("Pantalla de Home")).not.toBeInTheDocument();
    });
  });

  describe("When the visitor already has a session", () => {
    it("Then they are taken to Home, replacing the landing in the history", async () => {
      server.use(http.get(meUrl, () => HttpResponse.json(session)));

      const { router } = renderLanding();

      expect(await screen.findByText("Pantalla de Home")).toBeInTheDocument();
      expect(router.state.location.pathname).toBe("/home");
      expect(router.state.historyAction).toBe("REPLACE");
    });
  });
});
