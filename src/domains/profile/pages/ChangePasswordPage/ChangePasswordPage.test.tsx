import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { renderRoutes } from "../../../../test/renderRoutes";
import { server } from "../../../../test/server";
import ChangePasswordPage from "./ChangePasswordPage";

const baseUrl = import.meta.env.VITE_API_URL ?? "";
const routes = [
  { path: "/profile/edit/password", element: <ChangePasswordPage /> },
  { path: "/profile/edit", element: <p>Pantalla de edición</p> },
];

const submitPasswords = async (current: string, next: string) => {
  const { user } = renderRoutes(routes, ["/profile/edit/password"]);
  await user.type(screen.getByLabelText("Contraseña actual"), current);
  await user.type(screen.getByLabelText("Contraseña nueva"), next);
  await user.click(screen.getByRole("button", { name: "Cambiar contraseña" }));

  return user;
};

describe("Given the change password screen", () => {
  describe("When the user sends the current and a valid new password", () => {
    it("Then both are sent with the CSRF token and the user is told it worked", async () => {
      document.cookie = "csrfToken=csrf-123";
      let body: unknown = null;
      let header: string | null = null;
      server.use(
        http.post(`${baseUrl}/auth/me/password`, async ({ request }) => {
          body = await request.json();
          header = request.headers.get("X-CSRF-Token");
          return new HttpResponse(null, { status: 204 });
        }),
      );

      await submitPasswords("Vieja123!", "Nueva456!");

      expect(await screen.findByRole("status")).toHaveTextContent(
        "Contraseña actualizada",
      );
      expect(body).toEqual({
        currentPassword: "Vieja123!",
        newPassword: "Nueva456!",
      });
      expect(header).toBe("csrf-123");
    });
  });

  describe("When the user confirms it worked", () => {
    it("Then it goes back to the edit screen", async () => {
      document.cookie = "csrfToken=csrf-123";
      server.use(
        http.post(
          `${baseUrl}/auth/me/password`,
          () => new HttpResponse(null, { status: 204 }),
        ),
      );
      const user = await submitPasswords("Vieja123!", "Nueva456!");

      await user.click(await screen.findByRole("button", { name: "Listo" }));

      expect(
        await screen.findByText("Pantalla de edición"),
      ).toBeInTheDocument();
    });
  });

  describe("When the new password is too weak", () => {
    it("Then it is not sent", async () => {
      let requests = 0;
      server.use(
        http.post(`${baseUrl}/auth/me/password`, () => {
          requests += 1;
          return new HttpResponse(null, { status: 204 });
        }),
      );

      await submitPasswords("Vieja123!", "corta");

      expect(
        await screen.findByText("La contraseña no cumple los requisitos"),
      ).toBeInTheDocument();
      expect(requests).toBe(0);
    });
  });

  describe("When the current password is wrong", () => {
    it("Then the message is shown under that field", async () => {
      document.cookie = "csrfToken=csrf-123";
      server.use(
        http.post(`${baseUrl}/auth/me/password`, () =>
          HttpResponse.json(
            {
              error: {
                code: "AUTH_INVALID_CREDENTIALS",
                message: "La contraseña actual no es correcta",
              },
            },
            { status: 401 },
          ),
        ),
      );

      await submitPasswords("Mala1234!", "Nueva456!");

      expect(
        await screen.findByText("La contraseña actual no es correcta"),
      ).toBeInTheDocument();
    });
  });

  describe("When there have been too many wrong attempts", () => {
    it("Then the server message is shown as a general error", async () => {
      document.cookie = "csrfToken=csrf-123";
      server.use(
        http.post(`${baseUrl}/auth/me/password`, () =>
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

      await submitPasswords("Mala1234!", "Nueva456!");

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Demasiados intentos",
      );
    });
  });

  describe("When the user shows the password", () => {
    it("Then the field turns into plain text and can be hidden again", async () => {
      const { user } = renderRoutes(routes, ["/profile/edit/password"]);
      const field = screen.getByLabelText("Contraseña actual");

      await user.click(
        screen.getAllByRole("button", { name: "Mostrar contraseña" })[0],
      );

      expect(field).toHaveAttribute("type", "text");
      await user.click(
        screen.getByRole("button", { name: "Ocultar contraseña" }),
      );
      expect(field).toHaveAttribute("type", "password");
    });
  });
});
