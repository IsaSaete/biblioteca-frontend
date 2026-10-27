import { screen, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { renderRoutes } from "../../../../test/renderRoutes";
import { server } from "../../../../test/server";
import WishlistSection from "./WishlistSection";

const baseUrl = import.meta.env.VITE_API_URL ?? "";
const routes = [
  { path: "/home", element: <WishlistSection /> },
  { path: "/wishlist", element: <p>Pantalla de Quiero tener</p> },
];

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

const mockWishlist = (count: number) =>
  server.use(
    http.get(`${baseUrl}/wishlist`, () =>
      HttpResponse.json({
        items: Array.from({ length: count }, (_, i) => wishlistItem(i + 1)),
        nextCursor: null,
        total: count,
      }),
    ),
  );

describe("Given the wishlist section of the home screen", () => {
  describe("When there are more than six wanted books", () => {
    it("Then it shows only the first six covers", async () => {
      mockWishlist(9);

      renderRoutes(routes, ["/home"]);

      const carousel = await screen.findByRole("region", {
        name: "Quiero tener",
      });
      expect(
        within(carousel).getAllByRole("button", { name: /Autora/ }),
      ).toHaveLength(6);
    });
  });

  describe("When the user follows See all", () => {
    it("Then it goes to the wishlist screen", async () => {
      mockWishlist(2);
      const { user } = renderRoutes(routes, ["/home"]);

      await user.click(await screen.findByRole("link", { name: /Ver todos/ }));

      expect(await screen.findByText("Pantalla de Quiero tener")).toBeVisible();
    });
  });

  describe("When the user taps a cover", () => {
    it("Then the sheet of that book opens", async () => {
      mockWishlist(2);
      const { user } = renderRoutes(routes, ["/home"]);

      await user.click(
        await screen.findByRole("button", { name: /Libro 1, Autora/ }),
      );

      expect(
        await screen.findByRole("dialog", { name: "Libro guardado" }),
      ).toBeInTheDocument();
    });
  });

  describe("When there are no wanted books", () => {
    it("Then the section stays with an invitation and no action yet", async () => {
      mockWishlist(0);

      renderRoutes(routes, ["/home"]);

      expect(
        await screen.findByText(
          "Apunta aquí los libros que quieres conseguir. Cuando los tengas, pásalos a tu biblioteca.",
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Quiero tener" }),
      ).toBeVisible();
    });
  });

  describe("When the wishlist cannot be loaded", () => {
    it("Then it shows an inline error with a retry", async () => {
      server.use(
        http.get(`${baseUrl}/wishlist`, () =>
          HttpResponse.json(
            { error: { code: "INTERNAL", message: "Error" } },
            { status: 500 },
          ),
        ),
      );

      renderRoutes(routes, ["/home"]);

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
});
