import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { renderRoutes } from "../../../../test/renderRoutes";
import { server } from "../../../../test/server";
import LoginPage from "../../../auth/pages/LoginPage/LoginPage";
import ProfilePage from "../ProfilePage/ProfilePage";
import DeleteAccountPage from "./DeleteAccountPage";

const baseUrl = import.meta.env.VITE_API_URL ?? "";
const routes = [
  { path: "/profile", element: <ProfilePage /> },
  { path: "/profile/delete-account", element: <DeleteAccountPage /> },
  { path: "/login", element: <LoginPage /> },
];

const mockSession = () =>
  server.use(
    http.get(`${baseUrl}/auth/me`, () =>
      HttpResponse.json({
        user: { id: "1", name: "Isa", email: "isa@example.com" },
      }),
    ),
  );

const confirmDeletion = async (password?: string) => {
  mockSession();
  const { user } = renderRoutes(routes, ["/profile/delete-account"]);

  if (password) {
    await user.type(await screen.findByLabelText("Tu contraseña"), password);
  }
  await user.click(
    await screen.findByRole("button", { name: "Eliminar mi cuenta" }),
  );

  return user;
};

describe("Given the delete account screen", () => {
  beforeEach(() => {
    document.cookie = "csrfToken=csrf-123";
  });

  describe("When the user opens it from the profile", () => {
    it("Then it explains what is deleted and offers to download the data first", async () => {
      mockSession();
      const { user } = renderRoutes(routes, ["/profile"]);

      await user.click(
        await screen.findByRole("button", { name: "Eliminar cuenta" }),
      );

      expect(
        await screen.findByRole("heading", { name: "Eliminar cuenta" }),
      ).toBeInTheDocument();
      expect(screen.getByText(/No se puede deshacer/)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Descargar mis datos/ }),
      ).toBeInTheDocument();
    });
  });

  describe("When the user confirms with the password", () => {
    it("Then the account is deleted with the CSRF token and the user lands on login with a notice", async () => {
      let body: unknown = null;
      let header: string | null = null;
      server.use(
        http.delete(`${baseUrl}/auth/me`, async ({ request }) => {
          body = await request.json();
          header = request.headers.get("X-CSRF-Token");
          return new HttpResponse(null, { status: 204 });
        }),
      );

      await confirmDeletion("Clave123!");

      expect(
        await screen.findByText(/Tu cuenta y tus datos se han eliminado/),
      ).toBeInTheDocument();
      expect(body).toEqual({ password: "Clave123!" });
      expect(header).toBe("csrf-123");
    });
  });

  describe("When the user does not write the password", () => {
    it("Then it is asked for and nothing is sent", async () => {
      let requests = 0;
      server.use(
        http.delete(`${baseUrl}/auth/me`, () => {
          requests += 1;
          return new HttpResponse(null, { status: 204 });
        }),
      );

      await confirmDeletion();

      expect(
        await screen.findByText("Escribe tu contraseña para confirmar"),
      ).toBeInTheDocument();
      expect(requests).toBe(0);
    });
  });

  describe("When the password is wrong", () => {
    it("Then the message is shown under the field and the user stays", async () => {
      server.use(
        http.delete(`${baseUrl}/auth/me`, () =>
          HttpResponse.json(
            {
              error: {
                code: "AUTH_INVALID_CREDENTIALS",
                message: "La contraseña no es correcta",
              },
            },
            { status: 401 },
          ),
        ),
      );

      await confirmDeletion("Mala1234!");

      expect(
        await screen.findByText("La contraseña no es correcta"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Eliminar cuenta" }),
      ).toBeInTheDocument();
    });
  });

  describe("When there have been too many wrong attempts", () => {
    it("Then the server message is shown as a general error", async () => {
      server.use(
        http.delete(`${baseUrl}/auth/me`, () =>
          HttpResponse.json(
            {
              error: {
                code: "RATE_LIMITED",
                message: "Demasiados intentos con la contraseña incorrecta",
              },
            },
            { status: 429 },
          ),
        ),
      );

      await confirmDeletion("Mala1234!");

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Demasiados intentos",
      );
    });
  });
});
