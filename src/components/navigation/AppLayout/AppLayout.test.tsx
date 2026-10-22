import { screen, within } from "@testing-library/react";
import { renderRoutes } from "../../../test/renderRoutes";
import AppLayout from "./AppLayout";

const routes = [
  {
    element: <AppLayout />,
    children: [
      { path: "/library", element: <p>Contenido de biblioteca</p> },
      { path: "/quotes", element: <p>Contenido de citas</p> },
      { path: "/profile", element: <p>Contenido de perfil</p> },
    ],
  },
];

const setDesktopViewport = (isDesktop: boolean) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: isDesktop,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }));
};

describe("Given the layout of the screens with a session", () => {
  describe("When the viewport is smaller than 1024px", () => {
    it("Then the main navigation is a bar fixed at the bottom with the content above", () => {
      setDesktopViewport(false);

      renderRoutes(routes, ["/library"]);

      const navigation = screen.getByRole("navigation", {
        name: "Navegación principal",
      });
      expect(getComputedStyle(navigation).position).toBe("fixed");
      expect(getComputedStyle(navigation).bottom).toBe("0px");
      expect(screen.getByText("Contenido de biblioteca")).toBeInTheDocument();
    });
  });

  describe("When the viewport is 1024px or wider", () => {
    it("Then the main navigation is a side rail, not a bottom bar", () => {
      setDesktopViewport(true);

      renderRoutes(routes, ["/library"]);

      const navigation = screen.getByRole("navigation", {
        name: "Navegación principal",
      });
      expect(getComputedStyle(navigation).position).not.toBe("fixed");
      expect(
        within(navigation).getByRole("link", { name: "Biblioteca" }),
      ).toBeInTheDocument();
      expect(screen.getAllByRole("navigation")).toHaveLength(1);
    });
  });

  describe("When the user is on the library section", () => {
    it("Then only that link is marked as the current page", () => {
      setDesktopViewport(false);

      renderRoutes(routes, ["/library"]);

      expect(screen.getByRole("link", { name: "Biblioteca" })).toHaveAttribute(
        "aria-current",
        "page",
      );
      expect(screen.getByRole("link", { name: "Perfil" })).not.toHaveAttribute(
        "aria-current",
      );
    });
  });

  describe("When the user presses a section of the navigation", () => {
    it("Then that section is shown and becomes the current page", async () => {
      setDesktopViewport(false);
      const { user } = renderRoutes(routes, ["/library"]);

      await user.click(screen.getByRole("link", { name: "Perfil" }));

      expect(
        await screen.findByText("Contenido de perfil"),
      ).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Perfil" })).toHaveAttribute(
        "aria-current",
        "page",
      );
    });
  });

  describe("When the navigation is shown", () => {
    it("Then it only offers sections that exist", () => {
      setDesktopViewport(false);

      renderRoutes(routes, ["/library"]);

      expect(
        within(screen.getByRole("navigation", { name: "Navegación principal" }))
          .getAllByRole("link")
          .map((link) => link.textContent),
      ).toEqual(["Biblioteca", "Citas", "Perfil"]);
    });
  });
});
