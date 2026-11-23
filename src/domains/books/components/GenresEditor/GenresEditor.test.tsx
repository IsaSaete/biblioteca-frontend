import { useState } from "react";
import { screen, within } from "@testing-library/react";
import { renderRoutes } from "../../../../test/renderRoutes";
import { GENRES } from "../../utils/genres";
import GenresEditor from "./GenresEditor";

const Host = ({ initial = [] }: { initial?: string[] }) => {
  const [genres, setGenres] = useState(initial);

  return <GenresEditor genres={genres} onChange={setGenres} />;
};

const renderEditor = (initial: string[] = []) =>
  renderRoutes([{ path: "/", element: <Host initial={initial} /> }], ["/"]);

const getSearch = () => screen.getByRole("combobox", { name: "Buscar género" });

describe("Given the genres editor", () => {
  describe("When the book has genres", () => {
    it("Then they are shown and one can be removed", async () => {
      const { user } = renderEditor(["Fantasía", "Juvenil"]);

      const list = screen.getByRole("list", { name: "Géneros del libro" });
      expect(within(list).getByText("Fantasía")).toBeInTheDocument();
      await user.click(
        screen.getByRole("button", { name: "Quitar el género Fantasía" }),
      );

      expect(within(list).queryByText("Fantasía")).not.toBeInTheDocument();
      expect(within(list).getByText("Juvenil")).toBeInTheDocument();
    });
  });

  describe("When the search is opened", () => {
    it("Then the genres are listed alphabetically", async () => {
      const { user } = renderEditor();

      await user.click(getSearch());

      const names = screen
        .getAllByRole("option")
        .map((option) => option.textContent);
      expect(names).toEqual(
        [...GENRES].sort((a, b) => a.localeCompare(b, "es")),
      );
    });
  });

  describe("When the user types in the search", () => {
    it("Then only the matching genres are listed, ignoring accents and capitals", async () => {
      const { user } = renderEditor();

      await user.type(getSearch(), "POESIA");

      expect(
        screen.getByRole("option", { name: "Poesía" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("option", { name: "Historia" }),
      ).not.toBeInTheDocument();
    });

    it("Then choosing one adds it and it is no longer offered", async () => {
      const { user } = renderEditor();

      await user.type(getSearch(), "poes");
      await user.click(screen.getByRole("option", { name: "Poesía" }));

      const list = screen.getByRole("list", { name: "Géneros del libro" });
      expect(within(list).getByText("Poesía")).toBeInTheDocument();
      expect(getSearch()).toHaveValue("");
      expect(getSearch()).toHaveFocus();
      await user.type(getSearch(), "poes");
      expect(
        screen.queryByRole("option", { name: "Poesía" }),
      ).not.toBeInTheDocument();
    });

    it("Then pressing Enter adds the best match", async () => {
      const { user } = renderEditor();

      await user.type(getSearch(), "poesia{Enter}");

      const list = screen.getByRole("list", { name: "Géneros del libro" });
      expect(within(list).getByText("Poesía")).toBeInTheDocument();
      expect(getSearch()).toHaveValue("");
    });
  });

  describe("When what the user types is not in the catalog", () => {
    it("Then they can add it as their own genre, with a capital letter", async () => {
      const { user } = renderEditor();

      await user.type(getSearch(), "novela rosa");
      await user.click(
        screen.getByRole("option", {
          name: "Añadir «Novela rosa» como género propio",
        }),
      );

      const list = screen.getByRole("list", { name: "Géneros del libro" });
      expect(within(list).getByText("Novela rosa")).toBeInTheDocument();
      expect(getSearch()).toHaveValue("");
    });

    it("Then no own-genre option is offered for a genre of the catalog", async () => {
      const { user } = renderEditor();

      await user.type(getSearch(), "poesia");

      expect(
        screen.queryByRole("option", { name: /como género propio/ }),
      ).not.toBeInTheDocument();
    });
  });

  describe("When the book already has three genres", () => {
    it("Then it says the maximum was reached and offers no search", () => {
      renderEditor(["Fantasía", "Juvenil", "Aventuras"]);

      expect(
        screen.getByText("Has llegado al máximo de 3 géneros."),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("combobox", { name: "Buscar género" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("When there are no genres", () => {
    it("Then it says the book stays without genre", () => {
      renderEditor();

      expect(
        screen.getByText("Si no eliges ninguno, el libro se queda sin género."),
      ).toBeInTheDocument();
    });
  });

  describe("When there is at least one genre", () => {
    it("Then the no-genre hint is not shown", () => {
      renderEditor(["Fantasía"]);

      expect(
        screen.queryByText(
          "Si no eliges ninguno, el libro se queda sin género.",
        ),
      ).not.toBeInTheDocument();
    });
  });
});
