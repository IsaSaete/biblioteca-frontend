import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { routes } from "../../router/router";

const renderAt = (path: string) => {
  const router = createMemoryRouter(
    [
      ...routes.filter((route) => route.path !== "/"),
      { path: "/", element: <p>Inicio</p> },
    ],
    { initialEntries: [path] },
  );

  render(<RouterProvider router={router} />);

  return userEvent.setup();
};

describe("Given a URL that does not match any route", () => {
  describe("When the user opens it", () => {
    it("Then the not found page is shown", () => {
      renderAt("/does-not-exist");

      expect(
        screen.getByRole("heading", { name: "Página 404 de 403" }),
      ).toBeInTheDocument();
    });
  });

  describe("When the user presses the button to go back to the start", () => {
    it("Then they are taken to the root route", async () => {
      const user = renderAt("/does-not-exist");

      await user.click(
        screen.getByRole("button", { name: "Volver al inicio" }),
      );

      expect(screen.getByText("Inicio")).toBeInTheDocument();
    });
  });
});
