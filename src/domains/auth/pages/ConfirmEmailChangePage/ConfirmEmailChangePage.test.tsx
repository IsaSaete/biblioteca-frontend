import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { renderRoutes } from "../../../../test/renderRoutes";
import { server } from "../../../../test/server";
import ConfirmEmailChangePage from "./ConfirmEmailChangePage";

const baseUrl = import.meta.env.VITE_API_URL ?? "";
const routes = [
  { path: "/confirm-email-change", element: <ConfirmEmailChangePage /> },
  { path: "/login", element: <p>Pantalla de login</p> },
];

const mockConfirmation = (status: number, code?: string) =>
  server.use(
    http.get(`${baseUrl}/auth/confirm-email-change`, ({ request }) => {
      const token = new URL(request.url).searchParams.get("token");

      return status === 200 && token === "token-1"
        ? new HttpResponse(null, { status: 200 })
        : HttpResponse.json(
            { error: { code: code ?? "X", message: "x" } },
            { status },
          );
    }),
  );

describe("Given the page opened from the link sent to the new email", () => {
  describe("When the token is valid", () => {
    it("Then it says the email was updated and offers to log in", async () => {
      mockConfirmation(200);

      const { user } = renderRoutes(routes, [
        "/confirm-email-change?token=token-1",
      ]);

      expect(
        await screen.findByRole("heading", { name: "Email actualizado" }),
      ).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));
      expect(await screen.findByText("Pantalla de login")).toBeInTheDocument();
    });
  });

  describe("When the token has expired or was already used", () => {
    it("Then it says the link is not valid", async () => {
      mockConfirmation(400, "AUTH_INVALID_TOKEN");

      renderRoutes(routes, ["/confirm-email-change?token=caducado"]);

      expect(
        await screen.findByRole("heading", { name: "Enlace no válido" }),
      ).toBeInTheDocument();
    });
  });

  describe("When the link has no token", () => {
    it("Then it says the link is not valid", async () => {
      renderRoutes(routes, ["/confirm-email-change"]);

      expect(
        await screen.findByRole("heading", { name: "Enlace no válido" }),
      ).toBeInTheDocument();
    });
  });

  describe("When someone registered that email in the meantime", () => {
    it("Then it says the address is already in use", async () => {
      mockConfirmation(400, "AUTH_EMAIL_TAKEN");

      renderRoutes(routes, ["/confirm-email-change?token=token-2"]);

      expect(
        await screen.findByRole("heading", {
          name: "No se pudo cambiar el email",
        }),
      ).toBeInTheDocument();
    });
  });

  describe("When the connection fails", () => {
    it("Then it offers to retry", async () => {
      server.use(
        http.get(`${baseUrl}/auth/confirm-email-change`, () =>
          HttpResponse.error(),
        ),
      );

      renderRoutes(routes, ["/confirm-email-change?token=token-1"]);

      expect(
        await screen.findByRole("button", { name: "Reintentar" }),
      ).toBeInTheDocument();
    });
  });
});
