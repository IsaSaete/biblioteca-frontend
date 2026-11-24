import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { renderRoutes } from "../../../../test/renderRoutes";
import { server } from "../../../../test/server";
import { shakeThePhone } from "../../../../test/shakeThePhone";
import ShakeSuggestion from "./ShakeSuggestion";

const baseUrl = import.meta.env.VITE_API_URL ?? "";

const entry = (id: string, title: string) => ({
  book: {
    id,
    title,
    authors: ["Gabriel García Márquez"],
    publisher: "Alfaguara",
  },
  ejemplar: {
    id: `ejemplar-${id}`,
    bookId: id,
    status: "pending",
    favorite: false,
    createdAt: "2026-11-20T10:00:00.000Z",
  },
});

const quote = {
  id: "quote-1",
  text: "Muchos años después, frente al pelotón de fusilamiento.",
  page: 9,
  createdAt: "2026-11-21T10:00:00.000Z",
};

const mockQuotes = (items: object[] = [quote]) =>
  server.use(
    http.get(`${baseUrl}/quotes`, () =>
      HttpResponse.json({ items, nextCursor: null, total: items.length }),
    ),
  );

const renderHome = () =>
  renderRoutes(
    [
      { path: "/", element: <ShakeSuggestion /> },
      { path: "/library/:bookId", element: <p>Ficha del libro</p> },
    ],
    ["/"],
  );

describe("Given the shake suggestion on the home screen", () => {
  beforeEach(() => localStorage.clear());

  describe("When the secret is not activated and the phone is shaken", () => {
    it("Then nothing is asked and nothing appears", async () => {
      const requests: string[] = [];
      server.use(
        http.get(`${baseUrl}/books/random`, ({ request }) => {
          requests.push(request.url);
          return HttpResponse.json(entry("book-1", "Cien años de soledad"));
        }),
      );
      renderHome();

      await shakeThePhone();

      expect(requests).toEqual([]);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("When the secret is activated and the phone is shaken", () => {
    it("Then it suggests a book of the library with one of its quotes", async () => {
      localStorage.setItem("glosa.shake", "on");
      server.use(
        http.get(`${baseUrl}/books/random`, () =>
          HttpResponse.json(entry("book-1", "Cien años de soledad")),
        ),
      );
      mockQuotes();
      renderHome();

      await shakeThePhone();

      const dialog = await screen.findByRole("dialog", {
        name: "Un libro de tu estantería",
      });
      expect(dialog).toHaveTextContent("Cien años de soledad");
      expect(dialog).toHaveTextContent("Gabriel García Márquez");
      expect(dialog).toHaveTextContent(quote.text);
      expect(dialog).toHaveTextContent("Pág. 9");
    });

    it("Then a book without quotes is suggested without a quote", async () => {
      localStorage.setItem("glosa.shake", "on");
      server.use(
        http.get(`${baseUrl}/books/random`, () =>
          HttpResponse.json(entry("book-1", "Cien años de soledad")),
        ),
      );
      mockQuotes([]);
      renderHome();

      await shakeThePhone();

      await screen.findByText("Cien años de soledad");
      expect(screen.queryByText(/Pág\./)).not.toBeInTheDocument();
    });

    it("Then Otro asks for another one, excluding the last", async () => {
      localStorage.setItem("glosa.shake", "on");
      const urls: string[] = [];
      server.use(
        http.get(`${baseUrl}/books/random`, ({ request }) => {
          urls.push(request.url);
          return HttpResponse.json(
            urls.length === 1
              ? entry("book-1", "Cien años de soledad")
              : entry("book-2", "El coronel no tiene quien le escriba"),
          );
        }),
      );
      mockQuotes([]);
      const { user } = renderHome();
      await shakeThePhone();
      await screen.findByText("Cien años de soledad");

      await user.click(screen.getByRole("button", { name: "Otro" }));

      await screen.findByText("El coronel no tiene quien le escriba");
      expect(new URL(urls[1] ?? "").searchParams.get("exclude")).toBe("book-1");
    });

    it("Then Ver ficha opens the book page", async () => {
      localStorage.setItem("glosa.shake", "on");
      server.use(
        http.get(`${baseUrl}/books/random`, () =>
          HttpResponse.json(entry("book-1", "Cien años de soledad")),
        ),
      );
      mockQuotes([]);
      const { user, router } = renderHome();
      await shakeThePhone();
      await screen.findByText("Cien años de soledad");

      await user.click(screen.getByRole("button", { name: "Ver ficha" }));

      await waitFor(() =>
        expect(router.state.location.pathname).toBe("/library/book-1"),
      );
    });

    it("Then a second shake with the sheet open does not ask again", async () => {
      localStorage.setItem("glosa.shake", "on");
      let requests = 0;
      server.use(
        http.get(`${baseUrl}/books/random`, () => {
          requests += 1;
          return HttpResponse.json(entry("book-1", "Cien años de soledad"));
        }),
      );
      mockQuotes([]);
      renderHome();
      await shakeThePhone();
      await screen.findByText("Cien años de soledad");

      await shakeThePhone();

      expect(requests).toBe(1);
    });
  });

  describe("When the library has no book to suggest", () => {
    it("Then it says so in a friendly way", async () => {
      localStorage.setItem("glosa.shake", "on");
      server.use(
        http.get(`${baseUrl}/books/random`, () =>
          HttpResponse.json(
            { error: { code: "BOOK_NOT_FOUND", message: "mensaje" } },
            { status: 404 },
          ),
        ),
      );
      renderHome();

      await shakeThePhone();

      expect(
        await screen.findByText(/Todavía no tengo ningún libro que sugerirte/),
      ).toBeInTheDocument();
    });
  });

  describe("When the server fails", () => {
    it("Then it says it could not look for a book", async () => {
      localStorage.setItem("glosa.shake", "on");
      server.use(
        http.get(`${baseUrl}/books/random`, () =>
          HttpResponse.json(
            { error: { code: "INTERNAL_SERVER_ERROR", message: "mensaje" } },
            { status: 500 },
          ),
        ),
      );
      renderHome();

      await shakeThePhone();

      expect(
        await screen.findByText(/No he podido buscar un libro ahora/),
      ).toBeInTheDocument();
    });
  });
});
