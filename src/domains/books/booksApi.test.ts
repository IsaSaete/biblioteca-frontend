import { http, HttpResponse } from "msw";
import { createStore } from "../../store/store";
import { server } from "../../test/server";
import { booksApi } from "./booksApi";

const baseUrl = import.meta.env.VITE_API_URL ?? "";

const savedBook = {
  id: "book-1",
  isbn: "9788437604947",
  title: "Cien años de soledad",
  authors: ["Gabriel García Márquez"],
  publisher: "Cátedra",
};
const ejemplar = {
  id: "ejemplar-1",
  bookId: "book-1",
  status: "pending",
  createdAt: "2026-10-20T10:00:00.000Z",
};

describe("Given the books API", () => {
  describe("When the library is requested with a sort and a cursor", () => {
    it("Then it sends them as query params and returns the mapped page", async () => {
      let search = "";
      server.use(
        http.get(`${baseUrl}/books`, ({ request }) => {
          search = new URL(request.url).search;
          return HttpResponse.json({
            items: [
              {
                book: savedBook,
                ejemplar: { ...ejemplar, overrides: { title: "Cien años" } },
              },
            ],
            nextCursor: "abc",
          });
        }),
      );
      const store = createStore();

      const result = await store.dispatch(
        booksApi.endpoints.getBooks.initiate({ sort: "alpha", cursor: "xyz" }),
      );

      expect(search).toBe("?sort=alpha&cursor=xyz");
      expect(result.data?.nextCursor).toBe("abc");
      expect(result.data?.items[0]).toMatchObject({
        title: "Cien años",
        ejemplarId: "ejemplar-1",
      });
    });
  });

  describe("When the library is requested without params", () => {
    it("Then no query string is sent", async () => {
      let search: string | null = null;
      server.use(
        http.get(`${baseUrl}/books`, ({ request }) => {
          search = new URL(request.url).search;
          return HttpResponse.json({ items: [], nextCursor: null });
        }),
      );

      await createStore().dispatch(booksApi.endpoints.getBooks.initiate());

      expect(search).toBe("");
    });
  });

  describe("When an ISBN is looked up", () => {
    it("Then it returns the unwrapped external book", async () => {
      server.use(
        http.get(`${baseUrl}/books/lookup-isbn`, ({ request }) => {
          expect(new URL(request.url).searchParams.get("isbn")).toBe(
            "9788437604947",
          );
          return HttpResponse.json({
            book: { title: "Cien años", authors: ["GGM"] },
          });
        }),
      );

      const result = await createStore().dispatch(
        booksApi.endpoints.lookupIsbn.initiate("9788437604947"),
      );

      expect(result.data).toEqual({ title: "Cien años", authors: ["GGM"] });
    });
  });

  describe("When the external catalog is searched", () => {
    it("Then it returns the list of books without the wrapper", async () => {
      server.use(
        http.get(`${baseUrl}/books/search-external`, () =>
          HttpResponse.json({
            results: [
              { book: { title: "A", authors: ["X"] } },
              { book: { title: "B", authors: ["Y"] } },
            ],
          }),
        ),
      );

      const result = await createStore().dispatch(
        booksApi.endpoints.searchExternal.initiate("soledad"),
      );

      expect(result.data?.map((book) => book.title)).toEqual(["A", "B"]);
    });
  });

  describe("When a book is created", () => {
    it("Then it posts the body with the CSRF header and refetches the library", async () => {
      document.cookie = "csrfToken=csrf-123";
      let csrf: string | null = null;
      let body: unknown;
      let libraryRequests = 0;
      server.use(
        http.get(`${baseUrl}/books`, () => {
          libraryRequests += 1;
          return HttpResponse.json({ items: [], nextCursor: null });
        }),
        http.post(`${baseUrl}/books`, async ({ request }) => {
          csrf = request.headers.get("X-CSRF-Token");
          body = await request.json();
          return HttpResponse.json(
            { book: savedBook, ejemplar },
            { status: 201 },
          );
        }),
      );
      const store = createStore();
      const subscription = store.dispatch(
        booksApi.endpoints.getBooks.initiate(),
      );
      await subscription;

      const result = await store.dispatch(
        booksApi.endpoints.createBook.initiate({
          title: "Cien años de soledad",
          authors: ["Gabriel García Márquez"],
          publisher: "Cátedra",
          status: "pending",
        }),
      );
      await vi.waitFor(() => expect(libraryRequests).toBe(2));
      subscription.unsubscribe();

      expect(csrf).toBe("csrf-123");
      expect(body).toMatchObject({ publisher: "Cátedra", status: "pending" });
      expect(result).toMatchObject({
        data: { id: "book-1", status: "pending" },
      });
    });
  });

  describe("When the book is already in the library", () => {
    it("Then the error keeps the API code", async () => {
      server.use(
        http.post(`${baseUrl}/books`, () =>
          HttpResponse.json(
            {
              error: {
                code: "BOOK_ALREADY_IN_LIBRARY",
                message: "Ya lo tienes",
              },
            },
            { status: 409 },
          ),
        ),
      );

      const result = await createStoreCreate();

      expect(result.error).toMatchObject({
        status: 409,
        data: { error: { code: "BOOK_ALREADY_IN_LIBRARY" } },
      });
    });
  });
});

function createStoreCreate() {
  return createStore().dispatch(
    booksApi.endpoints.createBook.initiate({
      title: "T",
      authors: ["A"],
      publisher: "P",
    }),
  );
}
