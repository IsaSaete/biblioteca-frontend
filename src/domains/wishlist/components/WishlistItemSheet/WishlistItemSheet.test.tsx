import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { Provider } from "react-redux";
import { createStore } from "../../../../store/store";
import { server } from "../../../../test/server";
import type { WishlistItem } from "../../dto/WishlistItem";
import WishlistItemSheet from "./WishlistItemSheet";

const baseUrl = import.meta.env.VITE_API_URL ?? "";

const item: WishlistItem = {
  id: "item-1",
  book: {
    id: "book-1",
    title: "Cien años de soledad",
    authors: ["Gabriel García Márquez"],
    publisher: "Cátedra",
    synopsis: "La historia de los Buendía.",
  },
  note: "Me lo recomendó Ana",
  createdAt: "2026-10-27T10:00:00.000Z",
};

const renderSheet = () => {
  const onClose = vi.fn();
  render(
    <Provider store={createStore()}>
      <WishlistItemSheet item={item} onClose={onClose} />
    </Provider>,
  );

  return { onClose, user: userEvent.setup() };
};

describe("Given the sheet of a wishlist item", () => {
  beforeEach(() => {
    document.cookie = "csrfToken=csrf-123";
  });

  describe("When it is opened", () => {
    it("Then it shows the book data and the saved note", () => {
      renderSheet();

      expect(screen.getByText("Cien años de soledad")).toBeInTheDocument();
      expect(screen.getByText("Gabriel García Márquez")).toBeInTheDocument();
      expect(screen.getByLabelText("Nota")).toHaveValue("Me lo recomendó Ana");
      expect(
        screen.queryByRole("button", { name: "Guardar nota" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("When the note is edited and saved", () => {
    it("Then the new note is sent and the save button disappears", async () => {
      let body: unknown = null;
      server.use(
        http.patch(`${baseUrl}/wishlist/item-1`, async ({ request }) => {
          body = await request.json();
          return HttpResponse.json({ item });
        }),
      );
      const { user } = renderSheet();

      await user.clear(screen.getByLabelText("Nota"));
      await user.type(screen.getByLabelText("Nota"), "Regalo de cumpleaños");
      await user.click(screen.getByRole("button", { name: "Guardar nota" }));

      expect(body).toEqual({ note: "Regalo de cumpleaños" });
      await vi.waitFor(() =>
        expect(
          screen.queryByRole("button", { name: "Guardar nota" }),
        ).not.toBeInTheDocument(),
      );
    });

    it("Then clearing the note sends null", async () => {
      let body: unknown = null;
      server.use(
        http.patch(`${baseUrl}/wishlist/item-1`, async ({ request }) => {
          body = await request.json();
          return HttpResponse.json({ item });
        }),
      );
      const { user } = renderSheet();

      await user.clear(screen.getByLabelText("Nota"));
      await user.click(screen.getByRole("button", { name: "Guardar nota" }));

      await vi.waitFor(() => expect(body).toEqual({ note: null }));
    });
  });

  describe("When the user already has the book", () => {
    it("Then it asks for the status, preselecting Pending, and adds it to the library", async () => {
      let body: unknown = null;
      server.use(
        http.post(`${baseUrl}/wishlist/item-1/acquire`, async ({ request }) => {
          body = await request.json();
          return HttpResponse.json(
            {
              book: item.book,
              ejemplar: {
                id: "ejemplar-1",
                bookId: "book-1",
                status: "read",
                createdAt: "2026-10-27T10:00:00.000Z",
              },
            },
            { status: 201 },
          );
        }),
      );
      const { user, onClose } = renderSheet();

      await user.click(screen.getByRole("button", { name: "Ya lo tengo" }));
      expect(screen.getByRole("button", { name: "Pendiente" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      await user.click(screen.getByRole("button", { name: "Leído" }));
      await user.click(
        screen.getByRole("button", { name: "Añadir a mi biblioteca" }),
      );

      await vi.waitFor(() => expect(onClose).toHaveBeenCalled());
      expect(body).toEqual({ status: "read" });
    });
  });

  describe("When the user removes the book from the wishlist", () => {
    it("Then it asks for confirmation before removing it", async () => {
      let removed = false;
      server.use(
        http.delete(`${baseUrl}/wishlist/item-1`, () => {
          removed = true;
          return new HttpResponse(null, { status: 204 });
        }),
      );
      const { user, onClose } = renderSheet();

      await user.click(
        screen.getByRole("button", { name: "Quitar de deseados" }),
      );
      expect(removed).toBe(false);
      await user.click(screen.getByRole("button", { name: "Sí, quitar" }));

      await vi.waitFor(() => expect(onClose).toHaveBeenCalled());
      expect(removed).toBe(true);
    });
  });

  describe("When the server rejects adding it to the library", () => {
    it("Then it shows an error and stays open", async () => {
      server.use(
        http.post(`${baseUrl}/wishlist/item-1/acquire`, () =>
          HttpResponse.json(
            { error: { code: "INTERNAL", message: "Error" } },
            { status: 500 },
          ),
        ),
      );
      const { user, onClose } = renderSheet();

      await user.click(screen.getByRole("button", { name: "Ya lo tengo" }));
      await user.click(
        screen.getByRole("button", { name: "Añadir a mi biblioteca" }),
      );

      expect(
        await screen.findByText(
          "No se pudo añadir el libro. Inténtalo de nuevo.",
        ),
      ).toBeInTheDocument();
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
