import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { renderRoutes } from "../../../../test/renderRoutes";
import { server } from "../../../../test/server";
import ProfilePage from "./ProfilePage";

const baseUrl = import.meta.env.VITE_API_URL ?? "";
const routes = [{ path: "/profile", element: <ProfilePage /> }];

const user = {
  id: "user-1",
  name: "Isa",
  email: "isa@example.com",
  onboardingCompleted: true,
};

const mockSession = () =>
  server.use(http.get(`${baseUrl}/auth/me`, () => HttpResponse.json({ user })));

const openDialog = async () => {
  mockSession();
  const rendered = renderRoutes(routes, ["/profile"]);
  await rendered.user.click(
    await screen.findByRole("button", { name: /^Nombre/ }),
  );
  await screen.findByRole("dialog", { name: "Tu nombre" });

  return rendered.user;
};

describe("Given the name row in the account group of the profile", () => {
  describe("When the user opens it", () => {
    it("Then the dialog shows the current name", async () => {
      await openDialog();

      expect(screen.getByRole("textbox", { name: "Nombre" })).toHaveValue(
        "Isa",
      );
    });
  });

  describe("When the user saves a new name", () => {
    it("Then it is sent with the CSRF token, the dialog closes and the profile shows it", async () => {
      document.cookie = "csrfToken=csrf-123";
      let body: unknown = null;
      let header: string | null = null;
      server.use(
        http.patch(`${baseUrl}/auth/me`, async ({ request }) => {
          body = await request.json();
          header = request.headers.get("X-CSRF-Token");
          return HttpResponse.json({ user: { ...user, name: "Isabel" } });
        }),
      );
      const typist = await openDialog();
      const input = screen.getByRole("textbox", { name: "Nombre" });

      await typist.clear(input);
      await typist.type(input, "  Isabel ");
      await typist.click(screen.getByRole("button", { name: "Guardar" }));

      expect(
        await screen.findByRole("heading", { name: "Isabel" }),
      ).toBeInTheDocument();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(body).toEqual({ name: "Isabel" });
      expect(header).toBe("csrf-123");
    });
  });

  describe("When the user saves the name without changing it", () => {
    it("Then the dialog closes without calling the server", async () => {
      let requests = 0;
      server.use(
        http.patch(`${baseUrl}/auth/me`, () => {
          requests += 1;
          return HttpResponse.json({ user });
        }),
      );
      const typist = await openDialog();

      await typist.click(screen.getByRole("button", { name: "Guardar" }));

      await screen.findByRole("heading", { name: "Isa" });
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(requests).toBe(0);
    });
  });

  describe("When the user empties the name and saves", () => {
    it("Then it asks for a name and sends nothing", async () => {
      let requests = 0;
      server.use(
        http.patch(`${baseUrl}/auth/me`, () => {
          requests += 1;
          return HttpResponse.json({ user });
        }),
      );
      const typist = await openDialog();

      await typist.clear(screen.getByRole("textbox", { name: "Nombre" }));
      await typist.click(screen.getByRole("button", { name: "Guardar" }));

      expect(await screen.findByText("Escribe tu nombre")).toBeInTheDocument();
      expect(requests).toBe(0);
    });
  });

  describe("When the server rejects the name", () => {
    it("Then its message is shown under the field and the dialog stays open", async () => {
      document.cookie = "csrfToken=csrf-123";
      server.use(
        http.patch(`${baseUrl}/auth/me`, () =>
          HttpResponse.json(
            {
              error: {
                code: "VALIDATION_ERROR",
                message: "El nombre no es válido",
                field: "name",
              },
            },
            { status: 400 },
          ),
        ),
      );
      const typist = await openDialog();
      const input = screen.getByRole("textbox", { name: "Nombre" });

      await typist.clear(input);
      await typist.type(input, "Isabel");
      await typist.click(screen.getByRole("button", { name: "Guardar" }));

      expect(
        await screen.findByText("El nombre no es válido"),
      ).toBeInTheDocument();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  describe("When the server fails", () => {
    it("Then a general error is shown and the dialog stays open", async () => {
      document.cookie = "csrfToken=csrf-123";
      server.use(
        http.patch(`${baseUrl}/auth/me`, () =>
          HttpResponse.json(
            { error: { code: "INTERNAL_ERROR", message: "Algo falló" } },
            { status: 500 },
          ),
        ),
      );
      const typist = await openDialog();
      const input = screen.getByRole("textbox", { name: "Nombre" });

      await typist.type(input, "a");
      await typist.click(screen.getByRole("button", { name: "Guardar" }));

      expect(await screen.findByRole("alert")).toHaveTextContent("Algo falló");
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  describe("When the user cancels", () => {
    it("Then the dialog closes and the name stays", async () => {
      const typist = await openDialog();

      await typist.click(screen.getByRole("button", { name: "Cancelar" }));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Isa" })).toBeInTheDocument();
    });
  });
});
