import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { authApi } from "../../authApi";
import { createStore } from "../../../../store/store";
import { renderRoutes } from "../../../../test/renderRoutes";
import { server } from "../../../../test/server";
import LoginPage from "./LoginPage";

const loginUrl = `${import.meta.env.VITE_API_URL}/auth/login`;
const user = { id: "1", name: "Isa", email: "isa@example.com" };

const renderPage = (
  entry: string | { pathname: string; state: unknown } = "/login",
) => {
  const initialEntries = [entry] as Parameters<typeof renderRoutes>[1];

  return renderRoutes(
    [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <p>Registro</p> },
      { path: "/library", element: <p>Biblioteca</p> },
      { path: "/profile", element: <p>Perfil</p> },
    ],
    initialEntries,
  ).user;
};

const fillAndSubmit = async (actor: ReturnType<typeof userEvent.setup>) => {
  await actor.type(screen.getByLabelText("Email"), "isa@example.com");
  await actor.type(screen.getByLabelText("Contraseña"), "Secreta1!");
  await actor.click(screen.getByRole("button", { name: "Iniciar sesión" }));
};

describe("Given the login page", () => {
  describe("When it is shown", () => {
    it("Then it offers to register and to recover the password, and nothing unimplemented", () => {
      renderPage();

      expect(screen.getByRole("link", { name: "Regístrate" })).toHaveAttribute(
        "href",
        "/register",
      );
      expect(
        screen.getByRole("link", { name: "¿Olvidaste tu contraseña?" }),
      ).toHaveAttribute("href", "/forgot-password");
      expect(screen.queryByText(/google/i)).not.toBeInTheDocument();
    });
  });

  describe("When the user comes from resetting the password", () => {
    it("Then a confirmation message is shown", () => {
      renderPage({ pathname: "/login", state: { passwordReset: true } });

      expect(screen.getByRole("alert")).toHaveTextContent(
        "Contraseña actualizada",
      );
    });
  });

  describe("When the user submits an empty form", () => {
    it("Then both fields show an error and no request is sent", async () => {
      let requestSent = false;
      server.use(
        http.post(loginUrl, () => {
          requestSent = true;
          return HttpResponse.json({ user });
        }),
      );
      const actor = renderPage();

      await actor.click(screen.getByRole("button", { name: "Iniciar sesión" }));

      expect(
        await screen.findByText("Escribe un email válido"),
      ).toBeInTheDocument();
      expect(screen.getByText("Escribe tu contraseña")).toBeInTheDocument();
      expect(requestSent).toBe(false);
    });
  });

  describe("When the user focuses a field and leaves it empty", () => {
    it("Then the field is not marked as invalid", async () => {
      const actor = renderPage();
      const email = screen.getByLabelText("Email");

      await actor.click(email);
      await actor.tab();

      expect(email).toBeValid();
    });
  });

  describe("When the credentials are correct", () => {
    it("Then the data is sent as in the contract and the user goes to the library", async () => {
      let body: unknown;
      server.use(
        http.post(loginUrl, async ({ request }) => {
          body = await request.json();
          return HttpResponse.json({ user });
        }),
      );
      const actor = renderPage();

      await fillAndSubmit(actor);

      expect(await screen.findByText("Biblioteca")).toBeInTheDocument();
      expect(body).toEqual({ email: "isa@example.com", password: "Secreta1!" });
    });
  });

  describe("When the user was redirected to login from another page", () => {
    it("Then after logging in they return to that page", async () => {
      server.use(http.post(loginUrl, () => HttpResponse.json({ user })));
      const actor = renderPage({
        pathname: "/login",
        state: { from: "/profile" },
      });

      await fillAndSubmit(actor);

      expect(await screen.findByText("Perfil")).toBeInTheDocument();
    });
  });

  describe("When the API answers AUTH_INVALID_CREDENTIALS", () => {
    it("Then a generic error is shown and the user stays on the page", async () => {
      server.use(
        http.post(loginUrl, () =>
          HttpResponse.json(
            {
              error: {
                code: "AUTH_INVALID_CREDENTIALS",
                message: "Email o contraseña incorrectos",
              },
            },
            { status: 401 },
          ),
        ),
      );
      const actor = renderPage();

      await fillAndSubmit(actor);

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Email o contraseña incorrectos",
      );
      expect(screen.queryByText("Biblioteca")).not.toBeInTheDocument();
    });
  });

  describe("When the API answers RATE_LIMITED", () => {
    it("Then the message of the API is shown", async () => {
      server.use(
        http.post(loginUrl, () =>
          HttpResponse.json(
            {
              error: {
                code: "RATE_LIMITED",
                message: "Demasiados intentos. Inténtalo más tarde",
              },
            },
            { status: 429 },
          ),
        ),
      );
      const actor = renderPage();

      await fillAndSubmit(actor);

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Demasiados intentos",
      );
    });
  });

  describe("When the request cannot reach the server", () => {
    it("Then a connection error is shown instead of a generic one", async () => {
      server.use(http.post(loginUrl, () => HttpResponse.error()));
      const actor = renderPage();

      await fillAndSubmit(actor);

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "No se pudo conectar con el servidor",
      );
    });
  });

  describe("When the user arrives at login with a session still cached", () => {
    it("Then the cached session data is discarded", async () => {
      const store = createStore();
      await store.dispatch(
        authApi.util.upsertQueryData("me", undefined, {
          user: { id: "1", name: "Isa", email: "isa@example.com" },
        }),
      );

      const cachedBefore = authApi.endpoints.me.select()(store.getState()).data;

      renderRoutes(
        [{ path: "/login", element: <LoginPage /> }],
        ["/login"],
        store,
      );

      expect(cachedBefore).toBeDefined();
      expect(
        authApi.endpoints.me.select()(store.getState()).data,
      ).toBeUndefined();
    });
  });
});
