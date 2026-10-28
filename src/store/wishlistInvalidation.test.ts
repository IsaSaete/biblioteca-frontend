import { http, HttpResponse } from "msw";
import { booksApi } from "../domains/books/booksApi";
import { wishlistApi } from "../domains/wishlist/wishlistApi";
import { server } from "../test/server";
import { createStore } from "./store";

const baseUrl = import.meta.env.VITE_API_URL ?? "";

describe("Given a wishlist already loaded", () => {
  beforeEach(() => {
    document.cookie = "csrfToken=csrf-123";
  });

  describe("When a book is added to the library", () => {
    it("Then the wishlist is requested again, because the server removes the wanted copy", async () => {
      let wishlistRequests = 0;
      server.use(
        http.get(`${baseUrl}/wishlist`, () => {
          wishlistRequests += 1;
          return HttpResponse.json({ items: [], nextCursor: null, total: 0 });
        }),
        http.post(`${baseUrl}/books`, () =>
          HttpResponse.json(
            {
              book: {
                id: "b1",
                title: "Libro",
                authors: ["A"],
                publisher: "E",
              },
              ejemplar: {
                id: "e1",
                bookId: "b1",
                status: "pending",
                createdAt: "2026-10-27T10:00:00.000Z",
              },
            },
            { status: 201 },
          ),
        ),
      );
      const store = createStore();
      const subscription = store.dispatch(
        wishlistApi.endpoints.getWishlist.initiate(),
      );
      await subscription;

      await store.dispatch(
        booksApi.endpoints.createBook.initiate({
          title: "Libro",
          authors: ["A"],
          publisher: "E",
        }),
      );

      await vi.waitFor(() => expect(wishlistRequests).toBe(2));
      subscription.unsubscribe();
    });
  });
});
