import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { renderRoutes } from "../../../../test/renderRoutes";
import { server } from "../../../../test/server";
import LibraryViewSelector from "./LibraryViewSelector";

const baseUrl = import.meta.env.VITE_API_URL ?? "";
const routes = [{ path: "/profile", element: <LibraryViewSelector /> }];

const mockSession = (libraryView?: "grid" | "list") =>
  server.use(
    http.get(`${baseUrl}/auth/me`, () =>
      HttpResponse.json({
        user: {
          id: "user-1",
          name: "Isa",
          email: "isa@example.com",
          onboardingCompleted: true,
          ...(libraryView && { preferences: { libraryView } }),
        },
      }),
    ),
  );

describe("Given the library view selector in the profile", () => {
  describe("When the account has no saved view", () => {
    it("Then the grid is shown as the current one", async () => {
      mockSession();

      renderRoutes(routes, ["/profile"]);

      expect(
        await screen.findByRole("button", { name: /Vista de biblioteca/ }),
      ).toHaveTextContent("Cuadrícula");
    });
  });

  describe("When the account saved the list view", () => {
    it("Then the list is shown and selected in the panel", async () => {
      mockSession("list");
      const { user } = renderRoutes(routes, ["/profile"]);
      const row = await screen.findByRole("button", {
        name: /Vista de biblioteca/,
      });
      await screen.findByText("Lista");

      await user.click(row);

      expect(await screen.findByRole("radio", { name: "Lista" })).toBeChecked();
    });
  });

  describe("When the user chooses the list view", () => {
    it("Then it is saved in the account and shown in the row", async () => {
      document.cookie = "csrfToken=csrf-123";
      mockSession("grid");
      let body: unknown = null;
      let header: string | null = null;
      server.use(
        http.patch(`${baseUrl}/auth/me/preferences`, async ({ request }) => {
          body = await request.json();
          header = request.headers.get("X-CSRF-Token");
          return HttpResponse.json({ preferences: { libraryView: "list" } });
        }),
      );
      const { user } = renderRoutes(routes, ["/profile"]);
      await user.click(
        await screen.findByRole("button", { name: /Vista de biblioteca/ }),
      );

      await user.click(await screen.findByRole("radio", { name: "Lista" }));

      expect(
        await screen.findByRole("button", { name: /Vista de biblioteca/ }),
      ).toHaveTextContent("Lista");
      expect(body).toEqual({ libraryView: "list" });
      expect(header).toBe("csrf-123");
    });
  });

  describe("When the server fails to save the choice", () => {
    it("Then the row goes back to the previous view", async () => {
      document.cookie = "csrfToken=csrf-123";
      mockSession("grid");
      server.use(
        http.patch(`${baseUrl}/auth/me/preferences`, () =>
          HttpResponse.json(
            { error: { code: "X", message: "x" } },
            { status: 500 },
          ),
        ),
      );
      const { user } = renderRoutes(routes, ["/profile"]);
      await user.click(
        await screen.findByRole("button", { name: /Vista de biblioteca/ }),
      );

      await user.click(await screen.findByRole("radio", { name: "Lista" }));

      expect(
        await screen.findByRole("button", { name: /Vista de biblioteca/ }),
      ).toHaveTextContent("Cuadrícula");
    });
  });
});
