import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { renderRoutes } from "../../../../test/renderRoutes";
import { server } from "../../../../test/server";
import ChangePasswordPage from "../ChangePasswordPage/ChangePasswordPage";
import ProfilePage from "../ProfilePage/ProfilePage";
import EditProfilePage from "./EditProfilePage";

const baseUrl = import.meta.env.VITE_API_URL ?? "";
const routes = [
  { path: "/profile", element: <ProfilePage /> },
  { path: "/profile/edit", element: <EditProfilePage /> },
  { path: "/profile/edit/password", element: <ChangePasswordPage /> },
];

const user = {
  id: "user-1",
  name: "Isa",
  email: "isa@example.com",
  onboardingCompleted: true,
};

const mockSession = () =>
  server.use(http.get(`${baseUrl}/auth/me`, () => HttpResponse.json({ user })));

const renderEditPage = async () => {
  mockSession();
  const { user: typist } = renderRoutes(routes, ["/profile/edit"]);
  await screen.findByRole("textbox", { name: "Nombre" });

  return typist;
};

describe("Given the edit profile screen", () => {
  describe("When the user opens it from the profile", () => {
    it("Then the name is shown, ready to edit", async () => {
      mockSession();
      const { user: typist } = renderRoutes(routes, ["/profile"]);

      await typist.click(
        await screen.findByRole("button", { name: "Editar perfil" }),
      );

      expect(
        await screen.findByRole("textbox", { name: "Nombre" }),
      ).toHaveValue("Isa");
      expect(
        screen.getByRole("heading", { name: "Editar perfil" }),
      ).toBeInTheDocument();
    });
  });

  describe("When the name has not changed", () => {
    it("Then saving is not offered", async () => {
      await renderEditPage();

      expect(screen.getByRole("button", { name: "Guardar" })).toBeDisabled();
    });
  });

  describe("When the user saves a new name", () => {
    it("Then it is sent with the CSRF token and the profile shows it", async () => {
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
      const typist = await renderEditPage();
      const input = screen.getByRole("textbox", { name: "Nombre" });

      await typist.clear(input);
      await typist.type(input, "  Isabel ");
      await typist.click(screen.getByRole("button", { name: "Guardar" }));

      expect(
        await screen.findByRole("heading", { name: "Isabel" }),
      ).toBeInTheDocument();
      expect(body).toEqual({ name: "Isabel" });
      expect(header).toBe("csrf-123");
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
      const typist = await renderEditPage();

      await typist.clear(screen.getByRole("textbox", { name: "Nombre" }));
      await typist.type(screen.getByRole("textbox", { name: "Nombre" }), " ");
      await typist.click(screen.getByRole("button", { name: "Guardar" }));

      expect(await screen.findByText("Escribe tu nombre")).toBeInTheDocument();
      expect(requests).toBe(0);
    });
  });

  describe("When the server rejects the name", () => {
    it("Then its message is shown under the field", async () => {
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
      const typist = await renderEditPage();

      await typist.type(screen.getByRole("textbox", { name: "Nombre" }), "a");
      await typist.click(screen.getByRole("button", { name: "Guardar" }));

      expect(
        await screen.findByText("El nombre no es válido"),
      ).toBeInTheDocument();
    });
  });

  describe("When the server fails", () => {
    it("Then a general error is shown and the user stays on the screen", async () => {
      document.cookie = "csrfToken=csrf-123";
      server.use(
        http.patch(`${baseUrl}/auth/me`, () =>
          HttpResponse.json(
            { error: { code: "INTERNAL_ERROR", message: "Algo falló" } },
            { status: 500 },
          ),
        ),
      );
      const typist = await renderEditPage();

      await typist.type(screen.getByRole("textbox", { name: "Nombre" }), "a");
      await typist.click(screen.getByRole("button", { name: "Guardar" }));

      expect(await screen.findByRole("alert")).toHaveTextContent("Algo falló");
    });
  });

  describe("When the user opens the password row", () => {
    it("Then it has its own screen and going back returns to the edit screen", async () => {
      const typist = await renderEditPage();
      await typist.click(screen.getByRole("button", { name: "Contraseña" }));
      await screen.findByRole("heading", { name: "Cambiar contraseña" });

      await typist.click(screen.getByRole("button", { name: "Volver" }));

      expect(
        await screen.findByRole("heading", { name: "Editar perfil" }),
      ).toBeInTheDocument();
    });
  });
});
