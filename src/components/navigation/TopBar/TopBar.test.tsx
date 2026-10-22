import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { renderRoutes } from "../../../test/renderRoutes";
import { server } from "../../../test/server";
import TopBar from "./TopBar";

const baseUrl = import.meta.env.VITE_API_URL ?? "";
const routes = [
  { path: "/", element: <TopBar /> },
  { path: "/library/:bookId", element: <p>Ficha del libro</p> },
];

const entry = (id: string, title: string, author: string) => ({
  book: { id, title, authors: [author], publisher: "Editorial" },
  ejemplar: {
    id: `ejemplar-${id}`,
    bookId: id,
    status: "pending",
    createdAt: "2026-10-20T10:00:00.000Z",
  },
});

const mockLibrary = () => {
  const searches: (string | null)[] = [];
  server.use(
    http.get(`${baseUrl}/books`, ({ request }) => {
      searches.push(new URL(request.url).searchParams.get("search"));
      return HttpResponse.json({
        items: [
          entry("book-1", "1984", "George Orwell"),
          entry("book-2", "El principito", "Antoine de Saint-Exupéry"),
        ],
        nextCursor: null,
      });
    }),
  );
  return searches;
};

const stubCamera = (hasCamera: boolean) =>
  Object.defineProperty(navigator, "mediaDevices", {
    value: hasCamera
      ? {
          getUserMedia: vi.fn(),
          enumerateDevices: () => Promise.resolve([{ kind: "videoinput" }]),
        }
      : undefined,
    configurable: true,
  });

afterEach(() => stubCamera(false));

describe("Given the top bar", () => {
  describe("When the user types part of a title", () => {
    it("Then it suggests only the matching books of the library and opens the chosen one", async () => {
      const searches = mockLibrary();

      const { user } = renderRoutes(routes, ["/"]);
      await user.type(
        screen.getByRole("combobox", { name: "Buscar en tu biblioteca" }),
        "princ",
      );

      const option = await screen.findByRole("option", {
        name: /El principito/,
      });
      expect(
        screen.queryByRole("option", { name: /1984/ }),
      ).not.toBeInTheDocument();
      await waitFor(() => expect(searches).toContain("princ"));
      await user.click(option);

      expect(await screen.findByText("Ficha del libro")).toBeInTheDocument();
    });
  });

  describe("When the user searches by author", () => {
    it("Then the books of that author are suggested", async () => {
      mockLibrary();

      const { user } = renderRoutes(routes, ["/"]);
      await user.type(
        screen.getByRole("combobox", { name: "Buscar en tu biblioteca" }),
        "orwell",
      );

      expect(
        await screen.findByRole("option", { name: /1984/ }),
      ).toBeInTheDocument();
    });
  });

  describe("When nothing in the library matches", () => {
    it("Then it says so", async () => {
      mockLibrary();

      const { user } = renderRoutes(routes, ["/"]);
      await user.type(
        screen.getByRole("combobox", { name: "Buscar en tu biblioteca" }),
        "zzzz",
      );

      expect(
        await screen.findByText("Ningún libro de tu biblioteca coincide."),
      ).toBeInTheDocument();
    });
  });

  describe("When only one letter is typed", () => {
    it("Then it does not search yet", async () => {
      const searches = mockLibrary();

      const { user } = renderRoutes(routes, ["/"]);
      await user.type(
        screen.getByRole("combobox", { name: "Buscar en tu biblioteca" }),
        "p",
      );

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      expect(searches).toHaveLength(0);
    });
  });

  describe("When the device has a camera", () => {
    it("Then the scan icon opens the barcode scan directly", async () => {
      stubCamera(true);

      const { user, router } = renderRoutes(routes, ["/"]);
      await user.click(
        await screen.findByRole("button", {
          name: "Escanear el código de barras de un libro",
        }),
      );

      await waitFor(() =>
        expect(router.state.location.search).toBe("?modal=add-book&step=scan"),
      );
    });
  });

  describe("When the device has no camera", () => {
    it("Then there is no scan icon", async () => {
      stubCamera(false);

      renderRoutes(routes, ["/"]);

      expect(
        screen.queryByRole("button", {
          name: "Escanear el código de barras de un libro",
        }),
      ).not.toBeInTheDocument();
    });
  });
});
