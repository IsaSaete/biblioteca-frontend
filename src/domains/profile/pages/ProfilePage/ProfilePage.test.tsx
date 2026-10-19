import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { renderRoutes } from "../../../../test/renderRoutes";
import { server } from "../../../../test/server";
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
});
