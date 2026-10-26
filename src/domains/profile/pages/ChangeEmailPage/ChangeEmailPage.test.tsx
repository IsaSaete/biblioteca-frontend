import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { renderRoutes } from "../../../../test/renderRoutes";
import { server } from "../../../../test/server";
import ChangeEmailPage from "./ChangeEmailPage";

const baseUrl = import.meta.env.VITE_API_URL ?? "";
const routes = [
  { path: "/profile/edit/email", element: <ChangeEmailPage /> },
  { path: "/profile/edit", element: <p>Pantalla de edición</p> },
];

const submitEmail = async (newEmail: string, password: string) => {
  server.use(
    http.get(`${baseUrl}/auth/me`, () =>
      HttpResponse.json({
        user: { id: "user-1", name: "Isa", email: "isa@example.com" },
      }),
    ),
  );
  const { user } = renderRoutes(routes, ["/profile/edit/email"]);
  await user.type(await screen.findByLabelText("Email nuevo"), newEmail);
  await user.type(screen.getByLabelText("Tu contraseña"), password);
  await user.click(screen.getByRole("button", { name: "Enviar enlace" }));

  return user;
};

describe("Given the change email screen", () => {
  describe("When the user asks for a new email", () => {
    it("Then the request is sent and the user is told to confirm it from the new inbox", async () => {
      document.cookie = "csrfToken=csrf-123";
      let body: unknown = null;
      server.use(
        http.post(`${baseUrl}/auth/me/email`, async ({ request }) => {
          body = await request.json();
          return new HttpResponse(null, { status: 202 });
        }),
      );

      await submitEmail("nuevo@example.com", "Clave123!");

      expect(await screen.findByRole("status")).toHaveTextContent(
        "nuevo@example.com",
      );
      expect(body).toEqual({
        newEmail: "nuevo@example.com",
        currentPassword: "Clave123!",
      });
    });
  });

  describe("When the user confirms it was sent", () => {
    it("Then it goes back to the edit screen", async () => {
      document.cookie = "csrfToken=csrf-123";
      server.use(
        http.post(
          `${baseUrl}/auth/me/email`,
          () => new HttpResponse(null, { status: 202 }),
        ),
      );
      const user = await submitEmail("nuevo@example.com", "Clave123!");

      await user.click(
        await screen.findByRole("button", { name: "Entendido" }),
      );

      expect(
        await screen.findByText("Pantalla de edición"),
      ).toBeInTheDocument();
    });
  });

  describe("When the new email is the current one", () => {
    it("Then it is rejected without calling the server", async () => {
      let requests = 0;
      server.use(
        http.post(`${baseUrl}/auth/me/email`, () => {
          requests += 1;
          return new HttpResponse(null, { status: 202 });
        }),
      );

      await submitEmail("Isa@Example.com", "Clave123!");

      expect(await screen.findByText("Ese ya es tu email")).toBeInTheDocument();
      expect(requests).toBe(0);
    });
  });

  describe("When the email is already in use", () => {
    it("Then the server message is shown under the field", async () => {
      document.cookie = "csrfToken=csrf-123";
      server.use(
        http.post(`${baseUrl}/auth/me/email`, () =>
          HttpResponse.json(
            {
              error: {
                code: "AUTH_EMAIL_TAKEN",
                message: "Ese email ya está en uso",
              },
            },
            { status: 400 },
          ),
        ),
      );

      await submitEmail("otro@example.com", "Clave123!");

      expect(
        await screen.findByText("Ese email ya está en uso"),
      ).toBeInTheDocument();
    });
  });

  describe("When the password is wrong", () => {
    it("Then the message is shown under that field", async () => {
      document.cookie = "csrfToken=csrf-123";
      server.use(
        http.post(`${baseUrl}/auth/me/email`, () =>
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

      await submitEmail("nuevo@example.com", "Mala1234!");

      expect(
        await screen.findByText("La contraseña no es correcta"),
      ).toBeInTheDocument();
    });
  });
});
