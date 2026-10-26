import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { renderRoutes } from "../../../../test/renderRoutes";
import { server } from "../../../../test/server";
import EditProfilePage from "../../pages/EditProfilePage/EditProfilePage";

const resizeToAvatarJpeg = vi.fn();

vi.mock("../../utils/avatarImage", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../utils/avatarImage")>()),
  resizeToAvatarJpeg: (...args: unknown[]) => resizeToAvatarJpeg(...args),
}));

const baseUrl = import.meta.env.VITE_API_URL ?? "";
const routes = [{ path: "/profile/edit", element: <EditProfilePage /> }];

const user = {
  id: "user-1",
  name: "Isa",
  email: "isa@example.com",
  onboardingCompleted: true,
};

const mockSession = (avatarUrl: string | null = null) =>
  server.use(
    http.get(`${baseUrl}/auth/me`, () =>
      HttpResponse.json({ user: { ...user, avatarUrl } }),
    ),
  );

const choosePhoto = async () => {
  const rendered = renderRoutes(routes, ["/profile/edit"]);
  const input = await screen.findByLabelText("Cambiar foto");
  await rendered.user.upload(
    input,
    new File(["foto"], "yo.png", { type: "image/png" }),
  );

  return rendered.user;
};

describe("Given the photo of the edit profile screen", () => {
  beforeEach(() => {
    resizeToAvatarJpeg.mockReset();
    document.cookie = "csrfToken=csrf-123";
  });

  describe("When the account has no photo", () => {
    it("Then it offers to change it but not to remove it", async () => {
      mockSession();

      renderRoutes(routes, ["/profile/edit"]);

      expect(await screen.findByLabelText("Cambiar foto")).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Quitar foto" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("When the user chooses a photo", () => {
    it("Then the reduced JPEG is sent with the CSRF token and removing it is offered", async () => {
      mockSession();
      resizeToAvatarJpeg.mockResolvedValue(
        new Blob(["jpeg"], { type: "image/jpeg" }),
      );
      let contentType: string | null = null;
      let header: string | null = null;
      let size = 0;
      server.use(
        http.put(`${baseUrl}/auth/me/avatar`, async ({ request }) => {
          contentType = request.headers.get("Content-Type");
          header = request.headers.get("X-CSRF-Token");
          size = (await request.arrayBuffer()).byteLength;
          return HttpResponse.json({
            user: { ...user, avatarUrl: "/api/auth/me/avatar?v=1" },
          });
        }),
      );

      await choosePhoto();

      expect(
        await screen.findByRole("button", { name: "Quitar foto" }),
      ).toBeInTheDocument();
      expect(contentType).toBe("image/jpeg");
      expect(header).toBe("csrf-123");
      expect(size).toBe(4);
    });
  });

  describe("When the chosen file cannot be read", () => {
    it("Then an error is shown and nothing is sent", async () => {
      mockSession();
      resizeToAvatarJpeg.mockRejectedValue(new Error("no se puede leer"));
      let requests = 0;
      server.use(
        http.put(`${baseUrl}/auth/me/avatar`, () => {
          requests += 1;
          return HttpResponse.json({ user });
        }),
      );

      await choosePhoto();

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "No se pudo leer la foto",
      );
      expect(requests).toBe(0);
    });
  });

  describe("When the server rejects the photo", () => {
    it("Then its message is shown", async () => {
      mockSession();
      resizeToAvatarJpeg.mockResolvedValue(
        new Blob(["jpeg"], { type: "image/jpeg" }),
      );
      server.use(
        http.put(`${baseUrl}/auth/me/avatar`, () =>
          HttpResponse.json(
            {
              error: {
                code: "VALIDATION_ERROR",
                message: "La foto supera los 200 KB",
                field: "avatar",
              },
            },
            { status: 413 },
          ),
        ),
      );

      await choosePhoto();

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "La foto supera los 200 KB",
      );
    });
  });

  describe("When the user removes the photo", () => {
    it("Then it is deleted with the CSRF token and the option disappears", async () => {
      mockSession("/api/auth/me/avatar?v=1");
      let header: string | null = null;
      server.use(
        http.delete(`${baseUrl}/auth/me/avatar`, ({ request }) => {
          header = request.headers.get("X-CSRF-Token");
          return new HttpResponse(null, { status: 204 });
        }),
      );
      const { user: typist } = renderRoutes(routes, ["/profile/edit"]);

      await typist.click(
        await screen.findByRole("button", { name: "Quitar foto" }),
      );

      await screen.findByLabelText("Cambiar foto");
      expect(
        screen.queryByRole("button", { name: "Quitar foto" }),
      ).not.toBeInTheDocument();
      expect(header).toBe("csrf-123");
    });
  });

  describe("When removing the photo fails", () => {
    it("Then an error is shown and the photo stays", async () => {
      mockSession("/api/auth/me/avatar?v=1");
      server.use(
        http.delete(`${baseUrl}/auth/me/avatar`, () =>
          HttpResponse.json(
            { error: { code: "INTERNAL_ERROR", message: "Algo falló" } },
            { status: 500 },
          ),
        ),
      );
      const { user: typist } = renderRoutes(routes, ["/profile/edit"]);

      await typist.click(
        await screen.findByRole("button", { name: "Quitar foto" }),
      );

      expect(await screen.findByRole("alert")).toHaveTextContent("Algo falló");
      expect(
        screen.getByRole("button", { name: "Quitar foto" }),
      ).toBeInTheDocument();
    });
  });
});
