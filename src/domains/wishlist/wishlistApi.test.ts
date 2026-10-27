import { http, HttpResponse } from "msw";
import { booksApi } from "../books/booksApi";
import { createStore } from "../../store/store";
import { server } from "../../test/server";
import { wishlistApi } from "./wishlistApi";

const baseUrl = import.meta.env.VITE_API_URL ?? "";

const savedBook = {
  id: "book-1",
  title: "Cien años de soledad",
  authors: ["Gabriel García Márquez"],
  publisher: "Cátedra",
};
const item = {
  id: "item-1",
  book: savedBook,
  note: "Me lo recomendó Ana",
  createdAt: "2026-10-27T10:00:00.000Z",
};

describe("Given the wishlist API", () => {
  beforeEach(() => {
    document.cookie = "csrfToken=csrf-123";
  });

  describe("When the wishlist is requested with a cursor", () => {
    it("Then it sends it as a query param and returns the page", async () => {
      let search = "";
      server.use(
        http.get(`${baseUrl}/wishlist`, ({ request }) => {
          search = new URL(request.url).search;
          return HttpResponse.json({
            items: [item],
            nextCursor: "abc",
            total: 30,
          });
        }),
      );
      const store = createStore();

      const result = await store.dispatch(
        wishlistApi.endpoints.getWishlist.initiate({ cursor: "xyz" }),
      );

      expect(search).toBe("?cursor=xyz");
      expect(result.data).toEqual({
        items: [item],
        nextCursor: "abc",
        total: 30,
      });
    });
  });

  describe("When a book is added to the wishlist", () => {
    it("Then it posts the book with its note and returns the item", async () => {
      let body: unknown = null;
      server.use(
        http.post(`${baseUrl}/wishlist`, async ({ request }) => {
          body = await request.json();
          return HttpResponse.json({ item }, { status: 201 });
        }),
      );
      const store = createStore();

      const result = await store.dispatch(
        wishlistApi.endpoints.addToWishlist.initiate({
          title: "Cien años de soledad",
          authors: ["Gabriel García Márquez"],
          publisher: "Cátedra",
          note: "Me lo recomendó Ana",
        }),
      );

      expect(body).toMatchObject({ note: "Me lo recomendó Ana" });
      expect(result.data).toEqual(item);
    });
  });

  describe("When the note of an item is changed", () => {
    it("Then it patches only the note, and null when it is cleared", async () => {
      const bodies: unknown[] = [];
      server.use(
        http.patch(`${baseUrl}/wishlist/item-1`, async ({ request }) => {
          bodies.push(await request.json());
          return HttpResponse.json({ item });
        }),
      );
      const store = createStore();

      await store.dispatch(
        wishlistApi.endpoints.updateWishlistNote.initiate({
          id: "item-1",
          note: "Nueva",
        }),
      );
      await store.dispatch(
        wishlistApi.endpoints.updateWishlistNote.initiate({
          id: "item-1",
          note: null,
        }),
      );

      expect(bodies).toEqual([{ note: "Nueva" }, { note: null }]);
    });
  });

  describe("When an item is removed", () => {
    it("Then it sends the delete with the CSRF token", async () => {
      let csrf: string | null = null;
      server.use(
        http.delete(`${baseUrl}/wishlist/item-1`, ({ request }) => {
          csrf = request.headers.get("X-CSRF-Token");
          return new HttpResponse(null, { status: 204 });
        }),
      );
      const store = createStore();

      const result = await store.dispatch(
        wishlistApi.endpoints.removeFromWishlist.initiate("item-1"),
      );

      expect(result).not.toHaveProperty("error");
      expect(csrf).toBe("csrf-123");
    });
  });

  describe("When an item is acquired", () => {
    it("Then it sends the status, returns the library book and refreshes the library", async () => {
      let body: unknown = null;
      let booksRequests = 0;
      server.use(
        http.post(`${baseUrl}/wishlist/item-1/acquire`, async ({ request }) => {
          body = await request.json();
          return HttpResponse.json(
            {
              book: savedBook,
              ejemplar: {
                id: "ejemplar-1",
                bookId: "book-1",
                status: "reading",
                createdAt: "2026-10-27T10:00:00.000Z",
              },
            },
            { status: 201 },
          );
        }),
        http.get(`${baseUrl}/books`, () => {
          booksRequests += 1;
          return HttpResponse.json({
            items: [],
            nextCursor: null,
            total: 0,
          });
        }),
      );
      const store = createStore();
      await store.dispatch(booksApi.endpoints.getBooks.initiate());

      const result = await store.dispatch(
        wishlistApi.endpoints.acquireWishlistItem.initiate({
          id: "item-1",
          status: "reading",
        }),
      );

      expect(body).toEqual({ status: "reading" });
      expect(result.data).toMatchObject({
        ejemplarId: "ejemplar-1",
        status: "reading",
      });
      await vi.waitFor(() => expect(booksRequests).toBe(2));
    });
  });
});
