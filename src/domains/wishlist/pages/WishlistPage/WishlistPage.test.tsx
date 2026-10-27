import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { renderRoutes } from "../../../../test/renderRoutes";
import { server } from "../../../../test/server";
import WishlistPage from "./WishlistPage";

const baseUrl = import.meta.env.VITE_API_URL ?? "";
const routes = [{ path: "/wishlist", element: <WishlistPage /> }];

const wishlistItem = (id: number) => ({
  id: `item-${id}`,
  book: {
    id: `book-${id}`,
    title: `Libro ${id}`,
    authors: ["Autora"],
    publisher: "Editorial",
  },
  createdAt: "2026-10-27T10:00:00.000Z",
});

const mockWishlist = (count: number, nextCursor: string | null = null) =>
  server.use(
    http.get(`${baseUrl}/wishlist`, ({ request }) => {
      const cursor = new URL(request.url).searchParams.get("cursor");
      const items = cursor
        ? [wishlistItem(99)]
        : Array.from({ length: count }, (_, i) => wishlistItem(i + 1));

      return HttpResponse.json({
        items,
        nextCursor: cursor ? null : nextCursor,
        total: count,
      });
    }),
  );

describe("Given the wishlist page", () => {
  describe("When the user has wanted books", () => {
    it("Then it shows the count and a cover for each book", async () => {
      mockWishlist(3);

      renderRoutes(routes, ["/wishlist"]);

      expect(
        await screen.findByRole("button", { name: /Libro 1, Autora/ }),
      ).toBeInTheDocument();
      expect(screen.getAllByRole("button", { name: /Autora/ })).toHaveLength(3);
      expect(screen.getByText("3 libros")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Quiero tener" }),
      ).toBeInTheDocument();
    });
  });

  describe("When the wishlist is empty", () => {
    it("Then it shows the empty state", async () => {
      mockWishlist(0);

      renderRoutes(routes, ["/wishlist"]);

      expect(
        await screen.findByText("Todavía no has apuntado ningún libro"),
      ).toBeInTheDocument();
    });
  });

  describe("When the wishlist cannot be loaded", () => {
    it("Then it shows an error with a retry", async () => {
      server.use(
        http.get(`${baseUrl}/wishlist`, () =>
          HttpResponse.json(
            { error: { code: "INTERNAL", message: "Error" } },
            { status: 500 },
          ),
        ),
      );

      renderRoutes(routes, ["/wishlist"]);

      expect(
        await screen.findByText(
          "No hemos podido cargar tu lista Quiero tener.",
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Reintentar" }),
      ).toBeInTheDocument();
    });
  });

  describe("When the user taps a cover", () => {
    it("Then the sheet of that book opens", async () => {
      mockWishlist(2);
      const { user } = renderRoutes(routes, ["/wishlist"]);

      await user.click(
        await screen.findByRole("button", { name: /Libro 2, Autora/ }),
      );

      expect(
        await screen.findByRole("dialog", { name: "Libro guardado" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Ya lo tengo" }),
      ).toBeInTheDocument();
    });
  });
});
