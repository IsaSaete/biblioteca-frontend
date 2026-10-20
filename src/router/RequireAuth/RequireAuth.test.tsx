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

const routesWithOnboarding = [
  {
    element: <RequireAuth />,
    children: [
      { path: "/library", element: <p>Contenido privado</p> },
      { path: "/onboarding", element: <p>Pantalla de onboarding</p> },
    ],
  },
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

  describe("When the account has not seen the onboarding yet", () => {
    it("Then the user is sent to the onboarding instead of the requested page", async () => {
      server.use(
        http.get(`${baseUrl}/auth/me`, () =>
          HttpResponse.json({
            user: {
              id: "1",
              name: "Isa",
              email: "isa@example.com",
              onboardingCompleted: false,
            },
          }),
        ),
      );

      renderRoutes(routesWithOnboarding, ["/library"]);

      expect(
        await screen.findByText("Pantalla de onboarding"),
      ).toBeInTheDocument();
      expect(screen.queryByText("Contenido privado")).not.toBeInTheDocument();
    });

    it("Then the onboarding itself is reachable without redirecting in a loop", async () => {
      server.use(
        http.get(`${baseUrl}/auth/me`, () =>
          HttpResponse.json({
            user: {
              id: "1",
              name: "Isa",
              email: "isa@example.com",
              onboardingCompleted: false,
            },
          }),
        ),
      );

      renderRoutes(routesWithOnboarding, ["/onboarding"]);

      expect(
        await screen.findByText("Pantalla de onboarding"),
      ).toBeInTheDocument();
    });
  });

  describe("When the account has seen the onboarding or the backend does not report it", () => {
    it.each([true, undefined])(
      "Then the requested page is shown (onboardingCompleted = %s)",
      async (onboardingCompleted) => {
        server.use(
          http.get(`${baseUrl}/auth/me`, () =>
            HttpResponse.json({
              user: {
                id: "1",
                name: "Isa",
                email: "isa@example.com",
                onboardingCompleted,
              },
            }),
          ),
        );

        renderRoutes(routesWithOnboarding, ["/library"]);

        expect(
          await screen.findByText("Contenido privado"),
        ).toBeInTheDocument();
      },
    );
  });
});
