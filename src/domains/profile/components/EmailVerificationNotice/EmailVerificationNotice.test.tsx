import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { renderRoutes } from "../../../../test/renderRoutes";
import { server } from "../../../../test/server";
import EmailVerificationNotice from "./EmailVerificationNotice";

const baseUrl = import.meta.env.VITE_API_URL;
const resendUrl = `${baseUrl}/auth/me/verification-email`;

const routes = [{ path: "/", element: <EmailVerificationNotice /> }];

const useSession = (emailVerified?: boolean) =>
  server.use(
    http.get(`${baseUrl}/auth/me`, () =>
      HttpResponse.json({
        user: {
          id: "1",
          name: "Isa",
          email: "isa@example.com",
          ...(emailVerified === undefined ? {} : { emailVerified }),
        },
      }),
    ),
  );

describe("Given the email verification notice of the profile", () => {
  describe("When the email of the user is verified", () => {
    it("Then nothing is shown", async () => {
      useSession(true);

      renderRoutes(routes, ["/"]);

      await screen.findByRole("main", { hidden: true }).catch(() => undefined);
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Reenviar correo" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("When the session does not say whether the email is verified", () => {
    it("Then nothing is shown", async () => {
      useSession(undefined);

      renderRoutes(routes, ["/"]);

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
  });

  describe("When the email is not verified", () => {
    it("Then it explains it and offers to send the email again", async () => {
      useSession(false);

      renderRoutes(routes, ["/"]);

      expect(await screen.findByRole("status")).toHaveTextContent(
        "Tu correo aún no está verificado",
      );
      expect(
        screen.getByRole("button", { name: "Reenviar correo" }),
      ).toBeEnabled();
    });
  });

  describe("When the user asks to send the email again", () => {
    it("Then the request carries the CSRF token and the user is told where to look", async () => {
      document.cookie = "csrfToken=csrf-123";
      useSession(false);
      let csrf: string | null = null;
      server.use(
        http.post(resendUrl, ({ request }) => {
          csrf = request.headers.get("X-CSRF-Token");
          return new HttpResponse(null, { status: 202 });
        }),
      );
      const { user } = renderRoutes(routes, ["/"]);

      await user.click(
        await screen.findByRole("button", { name: "Reenviar correo" }),
      );

      expect(await screen.findByRole("status")).toHaveTextContent(
        "Te hemos enviado un correo a isa@example.com",
      );
      expect(csrf).toBe("csrf-123");
    });
  });

  describe("When the server limits the requests", () => {
    it("Then the message of the server is shown", async () => {
      useSession(false);
      server.use(
        http.post(resendUrl, () =>
          HttpResponse.json(
            {
              error: {
                code: "RATE_LIMITED",
                message: "Has pedido demasiados correos de verificación.",
              },
            },
            { status: 429 },
          ),
        ),
      );
      const { user } = renderRoutes(routes, ["/"]);

      await user.click(
        await screen.findByRole("button", { name: "Reenviar correo" }),
      );

      expect(await screen.findByRole("status")).toHaveTextContent(
        "Has pedido demasiados correos de verificación.",
      );
    });
  });

  describe("When the email turns out to be verified already", () => {
    it("Then the notice disappears", async () => {
      let verified = false;
      server.use(
        http.get(`${baseUrl}/auth/me`, () =>
          HttpResponse.json({
            user: {
              id: "1",
              name: "Isa",
              email: "isa@example.com",
              emailVerified: verified,
            },
          }),
        ),
        http.post(resendUrl, () => {
          verified = true;
          return HttpResponse.json(
            {
              error: {
                code: "AUTH_EMAIL_ALREADY_VERIFIED",
                message: "Tu email ya está verificado",
              },
            },
            { status: 409 },
          );
        }),
      );
      const { user } = renderRoutes(routes, ["/"]);

      await user.click(
        await screen.findByRole("button", { name: "Reenviar correo" }),
      );

      await vi.waitFor(() =>
        expect(screen.queryByRole("status")).not.toBeInTheDocument(),
      );
    });
  });
});
