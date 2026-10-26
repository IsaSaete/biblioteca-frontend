import { screen } from "@testing-library/react";
import { delay, http, HttpResponse } from "msw";
import { renderRoutes } from "../../../../test/renderRoutes";
import { server } from "../../../../test/server";
import ProfilePage from "./ProfilePage";

const downloadBlob = vi.fn();

vi.mock("../../utils/downloadBlob", () => ({
  downloadBlob: (...args: unknown[]) => downloadBlob(...args),
}));

const baseUrl = import.meta.env.VITE_API_URL ?? "";
const routes = [{ path: "/profile", element: <ProfilePage /> }];

const mockSession = () =>
  server.use(
    http.get(`${baseUrl}/auth/me`, () =>
      HttpResponse.json({
        user: { id: "1", name: "Isa", email: "isa@example.com" },
      }),
    ),
  );

const renderProfile = async () => {
  mockSession();
  const rendered = renderRoutes(routes, ["/profile"]);
  await screen.findByRole("heading", { name: "Isa" });

  return rendered.user;
};

describe("Given the download my data row of the profile", () => {
  beforeEach(() => {
    downloadBlob.mockReset();
  });

  describe("When the user presses it", () => {
    it("Then the data is requested and saved as glosa-datos.json", async () => {
      let hasBody = true;
      server.use(
        http.get(`${baseUrl}/auth/me/export`, async ({ request }) => {
          hasBody = (await request.text()) !== "";
          return new HttpResponse('{"user":{}}', {
            headers: {
              "Content-Type": "application/json",
              "Content-Disposition": 'attachment; filename="glosa-datos.json"',
            },
          });
        }),
      );
      const user = await renderProfile();

      await user.click(
        screen.getByRole("button", { name: /Descargar mis datos/ }),
      );

      await vi.waitFor(() => expect(downloadBlob).toHaveBeenCalledTimes(1));
      const [blob, filename] = downloadBlob.mock.calls[0] as [Blob, string];
      expect(filename).toBe("glosa-datos.json");
      expect(await blob.text()).toBe('{"user":{}}');
      expect(hasBody).toBe(false);
    });
  });

  describe("When the data takes a while to arrive", () => {
    it("Then the row says it is preparing and cannot be pressed again", async () => {
      server.use(
        http.get(`${baseUrl}/auth/me/export`, async () => {
          await delay(200);
          return new HttpResponse("{}");
        }),
      );
      const user = await renderProfile();

      await user.click(
        screen.getByRole("button", { name: /Descargar mis datos/ }),
      );

      const row = await screen.findByRole("button", { name: /Preparando/ });
      expect(row).toBeDisabled();
      await vi.waitFor(() => expect(downloadBlob).toHaveBeenCalled());
    });
  });

  describe("When the server limits the downloads", () => {
    it("Then its message is shown and nothing is saved", async () => {
      server.use(
        http.get(`${baseUrl}/auth/me/export`, () =>
          HttpResponse.json(
            {
              error: {
                code: "RATE_LIMITED",
                message: "Demasiadas descargas. Inténtalo más tarde",
              },
            },
            { status: 429 },
          ),
        ),
      );
      const user = await renderProfile();

      await user.click(
        screen.getByRole("button", { name: /Descargar mis datos/ }),
      );

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Demasiadas descargas",
      );
      expect(downloadBlob).not.toHaveBeenCalled();
    });
  });

  describe("When the download fails without an explanation", () => {
    it("Then a general message is shown", async () => {
      server.use(
        http.get(
          `${baseUrl}/auth/me/export`,
          () => new HttpResponse("caído", { status: 500 }),
        ),
      );
      const user = await renderProfile();

      await user.click(
        screen.getByRole("button", { name: /Descargar mis datos/ }),
      );

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "No se pudieron descargar tus datos",
      );
    });
  });
});
