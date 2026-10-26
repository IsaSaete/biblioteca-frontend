import { screen } from "@testing-library/react";
import { renderRoutes } from "../../../test/renderRoutes";
import BackButton from "./BackButton";

const routes = [
  { path: "/profile", element: <p>Pantalla de perfil</p> },
  { path: "/privacy", element: <BackButton fallbackTo="/profile" /> },
];

describe("Given a back button on a screen reached from another one", () => {
  afterEach(() => {
    window.history.replaceState(null, "");
  });

  describe("When the user came from inside the app and presses it", () => {
    it("Then it goes back to the previous screen", async () => {
      window.history.replaceState({ idx: 1 }, "");
      const { user } = renderRoutes(routes, ["/profile", "/privacy"]);

      await user.click(screen.getByRole("button", { name: "Volver" }));

      expect(await screen.findByText("Pantalla de perfil")).toBeInTheDocument();
    });
  });

  describe("When the user opened the screen directly and presses it", () => {
    it("Then it goes to the fallback screen", async () => {
      const { user } = renderRoutes(routes, ["/privacy"]);

      await user.click(screen.getByRole("button", { name: "Volver" }));

      expect(await screen.findByText("Pantalla de perfil")).toBeInTheDocument();
    });
  });
});
