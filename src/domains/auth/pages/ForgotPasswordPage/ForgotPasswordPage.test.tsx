import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { renderRoutes } from "../../../../test/renderRoutes";
import { server } from "../../../../test/server";
import ForgotPasswordPage from "./ForgotPasswordPage";

const forgotUrl = `${import.meta.env.VITE_API_URL}/auth/forgot-password`;

const renderPage = () =>
  renderRoutes(
    [
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/login", element: <p>Pantalla de login</p> },
    ],
    ["/forgot-password"],
  ).user;

const requestLink = async (actor: ReturnType<typeof renderPage>) => {
  await actor.type(screen.getByLabelText("Email"), "isa@example.com");
  await actor.click(screen.getByRole("button", { name: "Enviar enlace" }));
};

describe("Given the forgot password page", () => {
  describe("When the user submits an invalid email", () => {
    it("Then an error is shown and no request is sent", async () => {
      let requestSent = false;
      server.use(
        http.post(forgotUrl, () => {
          requestSent = true;
          return HttpResponse.json({});
        }),
      );
      const actor = renderPage();
      await actor.type(screen.getByLabelText("Email"), "isa@");

      await actor.click(screen.getByRole("button", { name: "Enviar enlace" }));

      expect(
        await screen.findByText("Escribe un email válido"),
      ).toBeInTheDocument();
      expect(requestSent).toBe(false);
    });
  });

  describe("When the backend has not confirmed the sending yet", () => {
    it("Then the confirmation is not shown", async () => {
      server.use(
        http.post(forgotUrl, async () => {
          await new Promise(() => undefined);
        }),
      );
      const actor = renderPage();

      await requestLink(actor);

      expect(screen.queryByText("Revisa tu correo")).not.toBeInTheDocument();
    });
  });

  describe("When the backend confirms the sending", () => {
    it("Then the email is sent as in the contract and the confirmation is shown", async () => {
      let body: unknown;
      server.use(
        http.post(forgotUrl, async ({ request }) => {
          body = await request.json();
          return HttpResponse.json({});
        }),
      );
      const actor = renderPage();

      await requestLink(actor);

      expect(
        await screen.findByRole("heading", { name: "Revisa tu correo" }),
      ).toBeInTheDocument();
      expect(body).toEqual({ email: "isa@example.com" });
      expect(
        screen.getByRole("button", { name: "Reenviar email" }),
      ).toBeInTheDocument();
    });
  });

  describe("When the sending fails", () => {
    it("Then an error is shown instead of the confirmation", async () => {
      server.use(
        http.post(forgotUrl, () =>
          HttpResponse.json(
            {
              error: { code: "RATE_LIMITED", message: "Demasiadas peticiones" },
            },
            { status: 429 },
          ),
        ),
      );
      const actor = renderPage();

      await requestLink(actor);

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Demasiadas peticiones",
      );
      expect(screen.queryByText("Revisa tu correo")).not.toBeInTheDocument();
    });
  });

  describe("When the user presses resend on the confirmation", () => {
    it("Then the email is requested again and the user is told", async () => {
      let requests = 0;
      server.use(
        http.post(forgotUrl, () => {
          requests += 1;
          return HttpResponse.json({});
        }),
      );
      const actor = renderPage();
      await requestLink(actor);

      await actor.click(
        await screen.findByRole("button", { name: "Reenviar email" }),
      );

      expect(await screen.findByRole("status")).toHaveTextContent(
        "Email reenviado",
      );
      expect(requests).toBe(2);
    });
  });

  describe("When the user presses the back arrow", () => {
    it("Then they return to login", async () => {
      const actor = renderPage();

      await actor.click(screen.getByRole("button", { name: "Volver" }));

      expect(await screen.findByText("Pantalla de login")).toBeInTheDocument();
    });
  });
});
