import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { renderRoutes } from "../../../../test/renderRoutes";
import { server } from "../../../../test/server";
import VerifyEmailPage from "./VerifyEmailPage";

const verifyUrl = `${import.meta.env.VITE_API_URL}/auth/verify-email`;

const renderPage = (entry = "/verify-email?token=abc123") =>
  renderRoutes(
    [
      { path: "/verify-email", element: <VerifyEmailPage /> },
      { path: "/library", element: <p>Biblioteca</p> },
    ],
    [entry],
  );

describe("Given the page opened from the verification email link", () => {
  describe("When the backend has not answered yet", () => {
    it("Then a verifying status is shown", () => {
      server.use(
        http.get(verifyUrl, async () => {
          await new Promise(() => undefined);
        }),
      );

      renderPage();

      expect(
        screen.getByRole("status", { name: "Verificando" }),
      ).toBeInTheDocument();
    });
  });

  describe("When the token is valid", () => {
    it("Then the token is sent to the API and the email is shown as verified", async () => {
      let token: string | null = null;
      server.use(
        http.get(verifyUrl, ({ request }) => {
          token = new URL(request.url).searchParams.get("token");
          return new HttpResponse(null, { status: 200 });
        }),
      );

      renderPage();

      expect(
        await screen.findByRole("heading", { name: "Correo verificado" }),
      ).toBeInTheDocument();
      expect(token).toBe("abc123");
    });

    it("Then the user can continue to the app", async () => {
      server.use(
        http.get(verifyUrl, () => new HttpResponse(null, { status: 200 })),
      );
      const { user } = renderPage();

      await user.click(
        await screen.findByRole("button", { name: "Continuar" }),
      );

      expect(await screen.findByText("Biblioteca")).toBeInTheDocument();
    });
  });

  describe("When the API answers AUTH_INVALID_TOKEN", () => {
    it("Then the invalid link state is shown without claiming the email is verified", async () => {
      server.use(
        http.get(verifyUrl, () =>
          HttpResponse.json(
            { error: { code: "AUTH_INVALID_TOKEN", message: "Caducado" } },
            { status: 400 },
          ),
        ),
      );

      renderPage();

      expect(
        await screen.findByRole("heading", { name: "Enlace no válido" }),
      ).toBeInTheDocument();
      expect(screen.queryByText("Correo verificado")).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Ir a Glosa" }),
      ).toBeInTheDocument();
    });
  });

  describe("When the link has no token", () => {
    it("Then it shows the invalid link state and sends no request", () => {
      let requestSent = false;
      server.use(
        http.get(verifyUrl, () => {
          requestSent = true;
          return new HttpResponse(null, { status: 200 });
        }),
      );

      renderPage("/verify-email");

      expect(
        screen.getByRole("heading", { name: "Enlace no válido" }),
      ).toBeInTheDocument();
      expect(requestSent).toBe(false);
    });
  });

  describe("When the request cannot reach the server", () => {
    it("Then a retry option is offered instead of saying the link is invalid", async () => {
      server.use(http.get(verifyUrl, () => HttpResponse.error()));

      renderPage();

      expect(
        await screen.findByRole("button", { name: "Reintentar" }),
      ).toBeInTheDocument();
      expect(screen.queryByText("Enlace no válido")).not.toBeInTheDocument();
    });
  });
});
