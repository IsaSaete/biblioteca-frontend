import { http, HttpResponse } from "msw";
import { authApi } from "../domains/auth/authApi";
import { booksApi } from "../domains/books/booksApi";
import { homeApi } from "../domains/home/homeApi";
import { quotesApi } from "../domains/quotes/quotesApi";
import { server } from "../test/server";
import { createStore } from "./store";

const baseUrl = import.meta.env.VITE_API_URL;
const isaUser = { id: "1", name: "Isa", email: "isa@example.com" };
const IsaQuote = {
  id: "q1",
  text: "Frase de Isa",
  createdAt: "2026-10-26T10:00:00.000Z",
};

// La caché de la usuaria anterior: sus citas, su biblioteca y sus cifras.
const fillWithIsaData = async (store: ReturnType<typeof createStore>) => {
  await store.dispatch(
    quotesApi.util.upsertQueryData("getQuotes", undefined, {
      items: [IsaQuote],
      nextCursor: null,
      total: 1,
    }),
  );
  await store.dispatch(
    booksApi.util.upsertQueryData("getBooks", undefined, {
      items: [],
      nextCursor: null,
      total: 3,
    }),
  );
  await store.dispatch(
    homeApi.util.upsertQueryData("getStats", undefined, {
      books: 3,
      quotes: 1,
      favorites: 0,
    }),
  );
};

const listCaches = (store: ReturnType<typeof createStore>) => {
  const state = store.getState();

  return [
    state.booksApi.queries,
    state.quotesApi.queries,
    state.homeApi.queries,
  ];
};

describe("Given a store that still holds the previous user's lists", () => {
  describe.each([
    [
      "logs in",
      (store: ReturnType<typeof createStore>) =>
        store.dispatch(
          authApi.endpoints.login.initiate({
            email: "otra@example.com",
            password: "Secreta1!",
          }),
        ),
    ],
    [
      "registers",
      (store: ReturnType<typeof createStore>) =>
        store.dispatch(
          authApi.endpoints.register.initiate({
            name: "Otra",
            email: "otra@example.com",
            password: "Secreta1!",
            acceptedTerms: true,
          }),
        ),
    ],
    [
      "logs out",
      (store: ReturnType<typeof createStore>) =>
        store.dispatch(authApi.endpoints.logout.initiate()),
    ],
    [
      "deletes the account",
      (store: ReturnType<typeof createStore>) =>
        store.dispatch(
          authApi.endpoints.deleteAccount.initiate({ password: "Secreta1!" }),
        ),
    ],
  ])("When someone %s", (_case, act) => {
    it("Then the library, the quotes and the numbers are discarded", async () => {
      server.use(
        http.post(`${baseUrl}/auth/login`, () =>
          HttpResponse.json({ user: isaUser }),
        ),
        http.post(`${baseUrl}/auth/register`, () =>
          HttpResponse.json({ user: isaUser }, { status: 201 }),
        ),
        http.post(
          `${baseUrl}/auth/logout`,
          () => new HttpResponse(null, { status: 204 }),
        ),
        http.delete(
          `${baseUrl}/auth/me`,
          () => new HttpResponse(null, { status: 204 }),
        ),
      );
      const store = createStore();
      await fillWithIsaData(store);
      expect(
        listCaches(store).map((queries) => Object.keys(queries).length),
      ).toEqual([1, 1, 1]);

      await act(store);

      expect(listCaches(store)).toEqual([{}, {}, {}]);
    });
  });

  describe("When an attempt to log in fails", () => {
    it("Then nothing changes: the session did not change hands", async () => {
      server.use(
        http.post(`${baseUrl}/auth/login`, () =>
          HttpResponse.json(
            { error: { code: "AUTH_INVALID_CREDENTIALS", message: "No" } },
            { status: 401 },
          ),
        ),
      );
      const store = createStore();
      await fillWithIsaData(store);

      await store.dispatch(
        authApi.endpoints.login.initiate({
          email: "otra@example.com",
          password: "mala",
        }),
      );

      expect(
        listCaches(store).map((queries) => Object.keys(queries).length),
      ).toEqual([1, 1, 1]);
    });
  });
});
