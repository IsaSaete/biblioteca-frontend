import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { renderRoutes } from "../../../../test/renderRoutes";
import { server } from "../../../../test/server";
import ResetPasswordPage from "./ResetPasswordPage";

const resetUrl = `${import.meta.env.VITE_API_URL}/auth/reset-password`;

const renderPage = (entry = "/reset-password?token=abc123") =>
  renderRoutes(
    [
      { path: "/reset-password", element: <ResetPasswordPage /> },
      { path: "/forgot-password", element: <p>Pantalla de recuperación</p> },
      { path: "/login", element: <p>Pantalla de login</p> },
    ],
    [entry],
  ).user;

const submitPassword = async (
  actor: ReturnType<typeof renderPage>,
  password: string,
) => {
  await actor.type(screen.getByLabelText("Contraseña"), password);
  await actor.click(screen.getByRole("button", { name: "Guardar contraseña" }));
};

describe("Given the reset password page", () => {
  describe("When the link has no token", () => {
    it("Then it shows the invalid link state without a form", () => {
      renderPage("/reset-password");

      expect(
        screen.getByRole("heading", { name: "Enlace no válido" }),
      ).toBeInTheDocument();
      expect(screen.queryByLabelText("Contraseña")).not.toBeInTheDocument();
    });
  });

  describe("When the user types a new password", () => {
    it("Then the requirements are shown in real time", async () => {
      const actor = renderPage();

      await actor.type(screen.getByLabelText("Contraseña"), "Abcdefg1");

      expect(screen.getAllByText("(cumplido)")).toHaveLength(3);
      expect(screen.getAllByText("(pendiente)")).toHaveLength(1);
    });
  });

  describe("When the user submits a password that does not meet the requirements", () => {
    it("Then an error is shown and no request is sent", async () => {
      let requestSent = false;
      server.use(
        http.post(resetUrl, () => {
          requestSent = true;
          return HttpResponse.json({});
        }),
      );
      const actor = renderPage();

      await submitPassword(actor, "abc");

      expect(
        await screen.findByText("La contraseña no cumple los requisitos"),
      ).toBeInTheDocument();
      expect(requestSent).toBe(false);
    });
  });

  describe("When the password is valid and the API accepts it", () => {
    it("Then token and new password are sent as in the contract and the user goes to login", async () => {
      let body: unknown;
      server.use(
        http.post(resetUrl, async ({ request }) => {
          body = await request.json();
          return HttpResponse.json({});
        }),
      );
      const actor = renderPage();

      await submitPassword(actor, "Secreta1!");

      expect(await screen.findByText("Pantalla de login")).toBeInTheDocument();
      expect(body).toEqual({ token: "abc123", newPassword: "Secreta1!" });
    });
  });

  describe("When the API answers AUTH_INVALID_TOKEN", () => {
    it("Then the invalid link state is shown with a way to request a new one", async () => {
      server.use(
        http.post(resetUrl, () =>
          HttpResponse.json(
            { error: { code: "AUTH_INVALID_TOKEN", message: "Caducado" } },
            { status: 400 },
          ),
        ),
      );
      const actor = renderPage();
      await submitPassword(actor, "Secreta1!");

      await actor.click(
        await screen.findByRole("button", {
          name: "Solicitar un enlace nuevo",
        }),
      );

      expect(
        await screen.findByText("Pantalla de recuperación"),
      ).toBeInTheDocument();
    });
  });

  describe("When the API answers AUTH_WEAK_PASSWORD for newPassword", () => {
    it("Then the error is shown on the password field", async () => {
      server.use(
        http.post(resetUrl, () =>
          HttpResponse.json(
            {
              error: {
                code: "AUTH_WEAK_PASSWORD",
                message: "La contraseña es demasiado débil",
                field: "newPassword",
              },
            },
            { status: 400 },
          ),
        ),
      );
      const actor = renderPage();

      await submitPassword(actor, "Secreta1!");

      expect(
        await screen.findByText("La contraseña es demasiado débil"),
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Contraseña")).toBeInvalid();
    });
  });
});
