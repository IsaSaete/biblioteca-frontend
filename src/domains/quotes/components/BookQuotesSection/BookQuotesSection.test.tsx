import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { renderRoutes } from "../../../../test/renderRoutes";
import { server } from "../../../../test/server";
import BookQuotesSection from "./BookQuotesSection";

const baseUrl = import.meta.env.VITE_API_URL ?? "";
const routes = [
  {
    path: "/",
    element: (
      <BookQuotesSection
        bookId="book-1"
        ejemplarId="ejemplar-1"
        bookTitle="1984"
      />
    ),
  },
];

const quote = (id: string, text: string, page?: number) => ({
  id,
  ejemplarId: "ejemplar-1",
  text,
  page,
  createdAt: "2026-10-22T10:00:00.000Z",
  book: { id: "book-1", title: "1984", authors: ["George Orwell"] },
});

describe("Given the quotes section of a book", () => {
  describe("When the book has quotes", () => {
    it("Then it shows the total and only the latest one, with its page", async () => {
      let bookId: string | null = null;
      server.use(
        http.get(`${baseUrl}/quotes`, ({ request }) => {
          bookId = new URL(request.url).searchParams.get("bookId");
          return HttpResponse.json({
            items: [
              quote("q2", "La guerra es la paz.", 9),
              quote("q1", "Otra cita más antigua."),
            ],
            nextCursor: null,
            total: 2,
          });
        }),
      );

      renderRoutes(routes, ["/"]);

      expect(
        await screen.findByRole("heading", { name: "Citas (2)" }),
      ).toBeInTheDocument();
      expect(screen.getByText("La guerra es la paz.")).toBeInTheDocument();
      expect(screen.getByText("Pág. 9")).toBeInTheDocument();
      expect(
        screen.queryByText("Otra cita más antigua."),
      ).not.toBeInTheDocument();
      expect(bookId).toBe("book-1");
    });
  });

  describe("When the book has more than one quote", () => {
    it("Then it links to all of them", async () => {
      server.use(
        http.get(`${baseUrl}/quotes`, () =>
          HttpResponse.json({
            items: [quote("q2", "Segunda"), quote("q1", "Primera")],
            nextCursor: null,
            total: 2,
          }),
        ),
      );

      renderRoutes(routes, ["/"]);

      expect(
        await screen.findByRole("link", { name: /Ver las 2 citas/ }),
      ).toHaveAttribute("href", "/library/book-1/quotes");
    });
  });

  describe("When the book has a single quote", () => {
    it("Then there is nothing else to see and no link", async () => {
      server.use(
        http.get(`${baseUrl}/quotes`, () =>
          HttpResponse.json({
            items: [quote("q1", "Primera")],
            nextCursor: null,
            total: 1,
          }),
        ),
      );

      renderRoutes(routes, ["/"]);
      await screen.findByText("Primera");

      expect(
        screen.queryByRole("link", { name: /Ver las/ }),
      ).not.toBeInTheDocument();
    });
  });

  describe("When the book has no quotes and the user looks for how to add one", () => {
    it("Then the add button is in the heading, not as a big button below", async () => {
      server.use(
        http.get(`${baseUrl}/quotes`, () =>
          HttpResponse.json({ items: [], nextCursor: null, total: 0 }),
        ),
      );

      renderRoutes(routes, ["/"]);
      const heading = await screen.findByRole("heading", { name: "Citas (0)" });

      expect(heading.parentElement).toContainElement(
        screen.getByRole("button", { name: "Añadir cita" }),
      );
    });
  });

  describe("When the book has no quotes", () => {
    it("Then it says so instead of showing an empty card", async () => {
      server.use(
        http.get(`${baseUrl}/quotes`, () =>
          HttpResponse.json({ items: [], nextCursor: null, total: 0 }),
        ),
      );

      renderRoutes(routes, ["/"]);

      expect(
        await screen.findByText("Todavía no has guardado citas de este libro."),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Citas (0)" }),
      ).toBeInTheDocument();
    });
  });

  describe("When the quotes fail to load", () => {
    it("Then it offers to retry and loads them", async () => {
      let attempts = 0;
      server.use(
        http.get(`${baseUrl}/quotes`, () => {
          attempts += 1;
          return attempts === 1
            ? HttpResponse.json(
                { error: { code: "INTERNAL" } },
                { status: 500 },
              )
            : HttpResponse.json({
                items: [quote("q1", "La guerra es la paz.")],
                nextCursor: null,
                total: 1,
              });
        }),
      );

      const { user } = renderRoutes(routes, ["/"]);
      await user.click(
        await screen.findByRole("button", { name: /reintentar/i }),
      );

      expect(
        await screen.findByText("La guerra es la paz."),
      ).toBeInTheDocument();
    });
  });

  describe("When the user adds a quote", () => {
    it("Then it sends it with the page, closes the dialog and refreshes the section", async () => {
      let body: unknown;
      let quotes = [] as ReturnType<typeof quote>[];
      server.use(
        http.get(`${baseUrl}/quotes`, () =>
          HttpResponse.json({
            items: quotes,
            nextCursor: null,
            total: quotes.length,
          }),
        ),
        http.post(`${baseUrl}/quotes`, async ({ request }) => {
          body = await request.json();
          quotes = [quote("q1", "Nueva cita", 12)];
          return HttpResponse.json({ quote: quotes[0] }, { status: 201 });
        }),
      );

      const { user } = renderRoutes(routes, ["/"]);
      await user.click(
        await screen.findByRole("button", { name: "Añadir cita" }),
      );
      await user.click(
        await screen.findByRole("button", { name: "Escribir manualmente" }),
      );
      await user.type(screen.getByLabelText("Cita"), "  Nueva cita ");
      await user.type(screen.getByLabelText("Página (opcional)"), "12");
      await user.click(screen.getByRole("button", { name: "Guardar cita" }));

      expect(
        await screen.findByText("Citas (1)", { exact: false }),
      ).toBeInTheDocument();
      expect(body).toEqual({
        ejemplarId: "ejemplar-1",
        text: "Nueva cita",
        page: 12,
        origin: "manual",
      });
      expect(
        screen.queryByRole("dialog", { name: "Añade una cita" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("When the user saves an empty quote", () => {
    it("Then it asks for the text and sends nothing", async () => {
      let hasPosted = false;
      server.use(
        http.get(`${baseUrl}/quotes`, () =>
          HttpResponse.json({ items: [], nextCursor: null, total: 0 }),
        ),
        http.post(`${baseUrl}/quotes`, () => {
          hasPosted = true;
          return HttpResponse.json({ quote: quote("q1", "x") });
        }),
      );

      const { user } = renderRoutes(routes, ["/"]);
      await user.click(
        await screen.findByRole("button", { name: "Añadir cita" }),
      );
      await user.click(
        await screen.findByRole("button", { name: "Escribir manualmente" }),
      );
      await user.click(screen.getByRole("button", { name: "Guardar cita" }));

      expect(await screen.findByText("Escribe la cita")).toBeInTheDocument();
      expect(hasPosted).toBe(false);
    });
  });

  describe("When the server rejects the page", () => {
    it("Then the message appears next to the page field", async () => {
      server.use(
        http.get(`${baseUrl}/quotes`, () =>
          HttpResponse.json({ items: [], nextCursor: null, total: 0 }),
        ),
        http.post(`${baseUrl}/quotes`, () =>
          HttpResponse.json(
            {
              error: {
                code: "VALIDATION_ERROR",
                message: "La página no es válida",
                field: "page",
              },
            },
            { status: 400 },
          ),
        ),
      );

      const { user } = renderRoutes(routes, ["/"]);
      await user.click(
        await screen.findByRole("button", { name: "Añadir cita" }),
      );
      await user.click(
        await screen.findByRole("button", { name: "Escribir manualmente" }),
      );
      await user.type(screen.getByLabelText("Cita"), "Hola");
      await user.click(screen.getByRole("button", { name: "Guardar cita" }));

      expect(
        await screen.findByText("La página no es válida"),
      ).toBeInTheDocument();
    });
  });
});
