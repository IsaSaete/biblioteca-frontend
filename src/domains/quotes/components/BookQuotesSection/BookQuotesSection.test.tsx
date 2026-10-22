import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { renderRoutes } from "../../../../test/renderRoutes";
import { server } from "../../../../test/server";
import BookQuotesSection from "./BookQuotesSection";

const baseUrl = import.meta.env.VITE_API_URL ?? "";
const routes = [{ path: "/", element: <BookQuotesSection bookId="book-1" /> }];

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
      expect(screen.queryByText("1984")).not.toBeInTheDocument();
      expect(
        screen.queryByText("Otra cita más antigua."),
      ).not.toBeInTheDocument();
      expect(bookId).toBe("book-1");
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
});
