import { screen } from "@testing-library/react";
import { renderRoutes } from "../../../../test/renderRoutes";
import WishlistLink from "./WishlistLink";

const routes = [
  { path: "/library", element: <WishlistLink /> },
  { path: "/wishlist", element: <p>Pantalla de Lista de deseos</p> },
];

describe("Given the wishlist link of the library header", () => {
  describe("When the user taps it", () => {
    it("Then it goes to the wishlist", async () => {
      const { user } = renderRoutes(routes, ["/library"]);

      await user.click(screen.getByRole("link", { name: "Lista de deseos" }));

      expect(
        await screen.findByText("Pantalla de Lista de deseos"),
      ).toBeInTheDocument();
    });
  });
});
