import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { renderRoutes } from "../../../../test/renderRoutes";
import { server } from "../../../../test/server";
import QuoteDetailPage from "./QuoteDetailPage";

const baseUrl = import.meta.env.VITE_API_URL ?? "";
const routes = [
  { path: "/library/:bookId", element: <p>Ficha del libro</p> },
  { path: "/quotes/:quoteId", element: <QuoteDetailPage /> },
];

const longText = `${"Muchos años después. ".repeat(20)}Fin.`;

const quote = (overrides?: object) => ({
  id: "q1",
  ejemplarId: "ejemplar-1",
  text: longText,
  page: 9,
  createdAt: "2026-10-22T10:00:00.000Z",
  book: { id: "book-1", title: "1984", authors: ["George Orwell"] },
  ...overrides,
});

const mockQuote = (value = quote()) =>
  server.use(
    http.get(`${baseUrl}/quotes/q1`, () => HttpResponse.json({ quote: value })),
  );

beforeEach(() =>
  server.use(
    http.get(`${baseUrl}/books/book-1`, () =>
      HttpResponse.json({
        book: {
          id: "book-1",
          title: "1984",
          authors: ["George Orwell"],
          publisher: "Debolsillo",
          coverUrl: "https://covers.test/1984.jpg",
        },
        ejemplar: {
          id: "ejemplar-1",
          bookId: "book-1",
          status: "reading",
          createdAt: "2026-10-20T10:00:00.000Z",
        },
      }),
    ),
  ),
);

describe("Given the quote detail page", () => {
  describe("When the quote loads", () => {
    it("Then it shows the full text, the page and the book without leaving", async () => {
      mockQuote();

      renderRoutes(routes, ["/quotes/q1"]);

      expect(await screen.findByText(longText)).toBeInTheDocument();
      expect(screen.getByText("Pág. 9")).toBeInTheDocument();
      expect(
        await screen.findByRole("img", { name: "Portada de 1984" }),
      ).toBeInTheDocument();
      expect(screen.getByText("George Orwell")).toBeInTheDocument();
      expect(screen.getByText("Guardada el 22 oct 2026")).toBeInTheDocument();
      expect(screen.queryByText("Ficha del libro")).not.toBeInTheDocument();
    });
  });

  describe("When the user taps Go to the book", () => {
    it("Then it opens the book detail", async () => {
      mockQuote();

      const { user } = renderRoutes(routes, ["/quotes/q1"]);
      await user.click(
        await screen.findByRole("button", { name: "Ir al libro" }),
      );

      expect(await screen.findByText("Ficha del libro")).toBeInTheDocument();
    });
  });

  describe("When the user copies the quote", () => {
    it("Then the text goes to the clipboard and a notice is shown", async () => {
      mockQuote();

      const { user } = renderRoutes(routes, ["/quotes/q1"]);
      await screen.findByText(longText);
      const writeText = vi
        .spyOn(navigator.clipboard, "writeText")
        .mockResolvedValue();
      await user.click(screen.getByRole("button", { name: "Copiar cita" }));

      expect(writeText).toHaveBeenCalledWith(longText);
      expect(await screen.findByText("Cita copiada")).toBeInTheDocument();
    });
  });

  describe("When copying the quote fails", () => {
    it("Then it says it could not be copied", async () => {
      mockQuote();

      const { user } = renderRoutes(routes, ["/quotes/q1"]);
      await screen.findByText(longText);
      vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(
        new Error("denied"),
      );
      await user.click(screen.getByRole("button", { name: "Copiar cita" }));

      expect(
        await screen.findByText("No se pudo copiar la cita"),
      ).toBeInTheDocument();
    });
  });

  describe("When the quote does not exist", () => {
    it("Then it says so", async () => {
      server.use(
        http.get(`${baseUrl}/quotes/q1`, () =>
          HttpResponse.json(
            { error: { code: "QUOTE_NOT_FOUND", message: "No existe" } },
            { status: 404 },
          ),
        ),
      );

      renderRoutes(routes, ["/quotes/q1"]);

      expect(
        await screen.findByText(
          "Esta cita no existe o ya no está en tu biblioteca.",
        ),
      ).toBeInTheDocument();
    });
  });

  describe("When the user corrects the text and clears the page", () => {
    it("Then it sends only what changed and shows the new text", async () => {
      let body: unknown;
      let current = quote();
      server.use(
        http.get(`${baseUrl}/quotes/q1`, () =>
          HttpResponse.json({ quote: current }),
        ),
        http.patch(`${baseUrl}/quotes/q1`, async ({ request }) => {
          body = await request.json();
          current = quote({ text: "Texto corregido", page: undefined });
          return HttpResponse.json({ quote: current });
        }),
      );

      const { user } = renderRoutes(routes, ["/quotes/q1"]);
      await user.click(
        await screen.findByRole("button", { name: "Editar cita" }),
      );
      const text = screen.getByLabelText("Cita");
      await user.clear(text);
      await user.type(text, "Texto corregido");
      await user.clear(screen.getByLabelText("Página (opcional)"));
      await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

      expect(await screen.findByText("Texto corregido")).toBeInTheDocument();
      expect(body).toEqual({ text: "Texto corregido", page: null });
      expect(screen.queryByText("Pág. 9")).not.toBeInTheDocument();
    });
  });

  describe("When the user saves the edit without changes", () => {
    it("Then it closes without sending anything", async () => {
      let hasPatched = false;
      mockQuote();
      server.use(
        http.patch(`${baseUrl}/quotes/q1`, () => {
          hasPatched = true;
          return HttpResponse.json({ quote: quote() });
        }),
      );

      const { user } = renderRoutes(routes, ["/quotes/q1"]);
      await user.click(
        await screen.findByRole("button", { name: "Editar cita" }),
      );
      await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

      expect(
        screen.queryByRole("dialog", { name: "Edita la cita" }),
      ).not.toBeInTheDocument();
      expect(hasPatched).toBe(false);
    });
  });

  describe("When the user confirms deleting the quote", () => {
    it("Then it deletes it and goes to the book", async () => {
      let hasDeleted = false;
      mockQuote();
      server.use(
        http.delete(`${baseUrl}/quotes/q1`, () => {
          hasDeleted = true;
          return new HttpResponse(null, { status: 204 });
        }),
      );

      const { user } = renderRoutes(routes, ["/quotes/q1"]);
      await user.click(
        await screen.findByRole("button", { name: "Eliminar cita" }),
      );
      await user.click(
        await screen.findByRole("button", { name: "Sí, eliminar" }),
      );

      expect(await screen.findByText("Ficha del libro")).toBeInTheDocument();
      expect(hasDeleted).toBe(true);
    });
  });

  describe("When deleting fails", () => {
    it("Then it shows an error and stays on the quote", async () => {
      mockQuote();
      server.use(
        http.delete(`${baseUrl}/quotes/q1`, () =>
          HttpResponse.json({ error: { code: "INTERNAL" } }, { status: 500 }),
        ),
      );

      const { user } = renderRoutes(routes, ["/quotes/q1"]);
      await user.click(
        await screen.findByRole("button", { name: "Eliminar cita" }),
      );
      await user.click(
        await screen.findByRole("button", { name: "Sí, eliminar" }),
      );

      expect(
        await screen.findByText(
          "No se pudo eliminar la cita. Inténtalo de nuevo.",
        ),
      ).toBeInTheDocument();
    });
  });

  describe("When the quote has no book", () => {
    it("Then it shows the source, offers no way to the book and edits only its own fields", async () => {
      let body: unknown;
      let current = {
        id: "q1",
        text: "Cita suelta",
        source: "Paper de Historia",
        createdAt: "2026-10-22T10:00:00.000Z",
      };
      server.use(
        http.get(`${baseUrl}/quotes/q1`, () =>
          HttpResponse.json({ quote: current }),
        ),
        http.patch(`${baseUrl}/quotes/q1`, async ({ request }) => {
          body = await request.json();
          current = { ...current, source: "Biblioteca" };
          return HttpResponse.json({ quote: current });
        }),
      );

      const { user } = renderRoutes(routes, ["/quotes/q1"]);

      expect(await screen.findByText("Paper de Historia")).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Ir al libro" }),
      ).not.toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Editar cita" }));
      const source = screen.getByLabelText("Fuente (opcional)");
      await user.clear(source);
      await user.type(source, "Biblioteca");
      await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

      expect(await screen.findByText("Biblioteca")).toBeInTheDocument();
      expect(body).toEqual({ source: "Biblioteca" });
    });
  });
});
