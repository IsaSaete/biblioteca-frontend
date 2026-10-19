import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { renderRoutes } from "../../test/renderRoutes";
import { server } from "../../test/server";
import RequireAuth from "./RequireAuth";

const baseUrl = import.meta.env.VITE_API_URL;
const routes = [
  {
    element: <RequireAuth />,
    children: [{ path: "/library", element: <p>Contenido privado</p> }],
  },
  { path: "/login", element: <p>Pantalla de login</p> },
];

const unauthenticated = () =>
  HttpResponse.json(
    { error: { code: "AUTH_UNAUTHENTICATED", message: "Sin sesión" } },
    { status: 401 },
  );

describe("Given a protected route", () => {
  describe("When the session is being checked", () => {
    it("Then a loading skeleton is shown", () => {
      server.use(
        http.get(`${baseUrl}/auth/me`, async () => {
          await new Promise(() => undefined);
        }),
      );

      renderRoutes(routes, ["/library"]);

      expect(
        screen.getByRole("status", { name: "Cargando" }),
      ).toBeInTheDocument();
    });
  });

  describe("When there is a valid session", () => {
    it("Then the protected content is shown", async () => {
      server.use(
        http.get(`${baseUrl}/auth/me`, () =>
          HttpResponse.json({
            user: { id: "1", name: "Isa", email: "isa@example.com" },
          }),
        ),
      );

      renderRoutes(routes, ["/library"]);

      expect(await screen.findByText("Contenido privado")).toBeInTheDocument();
    });
  });

  describe("When there is no session and it cannot be refreshed", () => {
    it("Then the user is sent to login", async () => {
      server.use(
        http.get(`${baseUrl}/auth/me`, unauthenticated),
        http.post(`${baseUrl}/auth/refresh`, unauthenticated),
      );

      renderRoutes(routes, ["/library"]);

      expect(await screen.findByText("Pantalla de login")).toBeInTheDocument();
      expect(screen.queryByText("Contenido privado")).not.toBeInTheDocument();
    });
  });

  describe("When the session check fails for a reason other than authentication", () => {
    it("Then an error with a retry button is shown instead of redirecting", async () => {
      server.use(
        http.get(`${baseUrl}/auth/me`, () =>
          HttpResponse.json(
            { error: { code: "X", message: "x" } },
            { status: 500 },
          ),
        ),
      );

      renderRoutes(routes, ["/library"]);

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "No hemos podido comprobar tu sesión",
      );
      expect(
        screen.getByRole("button", { name: "Reintentar" }),
      ).toBeInTheDocument();
    });
  });
});
