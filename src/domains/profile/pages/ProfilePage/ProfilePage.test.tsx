import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { renderRoutes } from "../../../../test/renderRoutes";
import { server } from "../../../../test/server";
import LoginPage from "../../../auth/pages/LoginPage/LoginPage";
import ProfilePage from "./ProfilePage";

const baseUrl = import.meta.env.VITE_API_URL;
const routes = [
  { path: "/profile", element: <ProfilePage /> },
  { path: "/login", element: <p>Pantalla de login</p> },
];

const useSession = () =>
  server.use(
    http.get(`${baseUrl}/auth/me`, () =>
      HttpResponse.json({
        user: { id: "1", name: "Isa", email: "isa@example.com" },
      }),
    ),
  );

describe("Given the profile page of a user with a session", () => {
  describe("When it is shown", () => {
    it("Then it displays the name and email of the user", async () => {
      useSession();

      renderRoutes(routes, ["/profile"]);

      expect(
        await screen.findByRole("heading", { name: "Isa" }),
      ).toBeInTheDocument();
      expect(screen.getByText("isa@example.com")).toBeInTheDocument();
    });
  });

  describe("When it is shown", () => {
    it("Then it links to the privacy policy and the terms of use", async () => {
      useSession();

      renderRoutes(routes, ["/profile"]);

      expect(
        await screen.findByRole("link", { name: "Política de privacidad" }),
      ).toHaveAttribute("href", "/privacy");
      expect(
        screen.getByRole("link", { name: "Términos de uso" }),
      ).toHaveAttribute("href", "/terms");
    });

    it("Then it says where the view and the theme are saved", async () => {
      useSession();

      renderRoutes(routes, ["/profile"]);

      expect(
        await screen.findByText(/el tema, solo en este dispositivo/),
      ).toBeInTheDocument();
    });
  });

  describe("When the user logs out", () => {
    it("Then the logout request carries the CSRF token and the user goes to login", async () => {
      document.cookie = "csrfToken=csrf-123";
      let header: string | null = null;
      useSession();
      server.use(
        http.post(`${baseUrl}/auth/logout`, ({ request }) => {
          header = request.headers.get("X-CSRF-Token");
          return new HttpResponse(null, { status: 204 });
        }),
      );
      const { user } = renderRoutes(routes, ["/profile"]);
      await screen.findByRole("heading", { name: "Isa" });

      await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));

      expect(await screen.findByText("Pantalla de login")).toBeInTheDocument();
      expect(header).toBe("csrf-123");
    });
  });

  describe("When the logout request fails", () => {
    it("Then an error is shown and the user stays on the page", async () => {
      useSession();
      server.use(
        http.post(`${baseUrl}/auth/logout`, () =>
          HttpResponse.json(
            { error: { code: "X", message: "x" } },
            { status: 500 },
          ),
        ),
      );
      const { user } = renderRoutes(routes, ["/profile"]);
      await screen.findByRole("heading", { name: "Isa" });

      await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "No se pudo cerrar la sesión",
      );
    });
  });

  describe("When the user logs out", () => {
    it("Then the session is not requested again from the page being left", async () => {
      document.cookie = "csrfToken=csrf-123";
      let meRequests = 0;
      server.use(
        http.get(`${baseUrl}/auth/me`, () => {
          meRequests += 1;
          return HttpResponse.json({
            user: { id: "1", name: "Isa", email: "isa@example.com" },
          });
        }),
        http.post(
          `${baseUrl}/auth/logout`,
          () => new HttpResponse(null, { status: 204 }),
        ),
      );
      const { user } = renderRoutes(
        [
          { path: "/profile", element: <ProfilePage /> },
          { path: "/login", element: <LoginPage /> },
        ],
        ["/profile"],
      );
      await screen.findByRole("heading", { name: "Isa" });

      await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));
      await screen.findByRole("heading", { name: "Bienvenido" });
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(meRequests).toBe(1);
    });
  });
});
