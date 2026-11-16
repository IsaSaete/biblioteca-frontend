import { ThemeProvider } from "@mui/material/styles";
import { screen, waitFor, within } from "@testing-library/react";
import { delay, http, HttpResponse } from "msw";
import theme from "../../../../theme/theme";
import { renderRoutes } from "../../../../test/renderRoutes";
import { server } from "../../../../test/server";
import { legalContact } from "../../../legal/content/legalContact";
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
      // «Entrar» está en la cabecera (la barra de móvil queda oculta).
      expect(
        screen
          .getAllByRole("link", { name: "Entrar" })
          .every((link) => link.getAttribute("href") === "/login"),
      ).toBe(true);
      expect(
        screen.getByRole("link", { name: /^FAQ.*preguntas frecuentes/ }),
      ).toHaveAttribute("href", "/faq");
      expect(screen.getByRole("link", { name: "Privacidad" })).toHaveAttribute(
        "href",
        "/privacy",
      );
      expect(screen.getByRole("link", { name: "Términos" })).toHaveAttribute(
        "href",
        "/terms",
      );
      expect(
        screen.getByRole("list", { name: "Garantías de Glosa" }),
      ).toHaveTextContent("Tus fotos no salen de tu dispositivo");
      expect(screen.getByRole("link", { name: "Contacto" })).toHaveAttribute(
        "href",
        `mailto:${legalContact.email}`,
      );
      expect(
        screen.getByRole("img", { name: /estantería con libros/i }),
      ).toBeInTheDocument();
      expect(screen.getAllByText("Gratis y sin anuncios.")[0]).toBeVisible();
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

  describe("When the landing is read from top to bottom", () => {
    it("Then the quotes and the data come before the filters", async () => {
      server.use(http.get(meUrl, () => HttpResponse.error()));

      renderLanding();

      const titles = screen
        .getAllByRole("heading", { level: 2 })
        .map((heading) => heading.textContent);
      expect(titles).toEqual([
        "Cuatro maneras de añadir un libro.",
        "Cuando una frase te llama la atención, guárdala.",
        "Tus datos son tuyos.",
        "Organiza tus libros a tu manera.",
        "glosaf.",
        "Empieza por el libro que tienes más cerca.",
      ]);
    });
  });

  describe("When the visitor reads the quotes section", () => {
    it("Then it explains the three steps to save a quote", async () => {
      server.use(http.get(meUrl, () => HttpResponse.error()));

      renderLanding();

      const steps = screen.getByRole("list", { name: "Cómo guardar una cita" });
      expect(
        within(steps)
          .getAllByRole("listitem")
          .map((item) => item.textContent),
      ).toEqual([
        "Haz la fotoCon la cámara, o elige una que ya tengas",
        "Recorta el textoDeja solo lo que quieres y corrígelo si hace falta",
        "Queda guardadaCon su libro y su página",
      ]);
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
