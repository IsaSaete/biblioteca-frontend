import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { legalContact } from "../../domains/legal/content/legalContact";
import { appRoutes, routes } from "../../router/router";
import ErrorPage from "./ErrorPage";

const Crashing = ({ error }: { error: Error }): never => {
  throw error;
};

const renderCrashing = (error: Error) => {
  const router = createMemoryRouter(
    [
      {
        errorElement: <ErrorPage />,
        children: [{ path: "/", element: <Crashing error={error} /> }],
      },
    ],
    { initialEntries: ["/"] },
  );

  render(<RouterProvider router={router} />);

  return userEvent.setup();
};

const originalLocation = window.location;
const reload = vi.fn();
const assign = vi.fn();
const consoleError = vi.fn();

beforeEach(() => {
  reload.mockReset();
  assign.mockReset();
  consoleError.mockReset();
  Object.defineProperty(window, "location", {
    configurable: true,
    value: { ...originalLocation, reload, assign },
  });
  // React y el enrutado cuentan el fallo por la consola: aquí es lo esperado.
  vi.spyOn(console, "error").mockImplementation(consoleError);
});

afterEach(() => {
  Object.defineProperty(window, "location", {
    configurable: true,
    value: originalLocation,
  });
  vi.restoreAllMocks();
});

describe("Given a screen of the app that fails while it is shown", () => {
  describe("When the error is unexpected", () => {
    it("Then the error screen is shown instead of a blank page, without the technical detail", async () => {
      renderCrashing(new Error("Cannot read properties of undefined (secret)"));

      expect(
        await screen.findByRole("heading", { name: "Algo ha ido mal" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Ha ocurrido un error inesperado/),
      ).toBeInTheDocument();
      expect(screen.queryByText(/secret/)).not.toBeInTheDocument();
    });

    it("Then the error is left in the console for whoever investigates it", async () => {
      const error = new Error("fallo de prueba");

      renderCrashing(error);
      await screen.findByRole("heading", { name: "Algo ha ido mal" });

      expect(consoleError).toHaveBeenCalledWith(error);
    });

    it("Then it offers the contact address of the legal texts", async () => {
      renderCrashing(new Error("boom"));

      expect(
        await screen.findByRole("link", { name: legalContact.email }),
      ).toHaveAttribute("href", `mailto:${legalContact.email}`);
    });

    it("Then reloading the page reloads it", async () => {
      const user = renderCrashing(new Error("boom"));

      await user.click(
        await screen.findByRole("button", { name: "Recargar la página" }),
      );

      expect(reload).toHaveBeenCalledTimes(1);
    });

    it("Then going back to the start loads the home with a full navigation, not with the router that failed", async () => {
      const user = renderCrashing(new Error("boom"));

      await user.click(
        await screen.findByRole("button", { name: "Volver al inicio" }),
      );

      expect(assign).toHaveBeenCalledWith("/");
    });
  });

  describe("When a new version was deployed while the web was open", () => {
    it("Then it says that Glosa has been updated and asks to reload, instead of calling it an error", async () => {
      renderCrashing(
        new TypeError(
          "Failed to fetch dynamically imported module: https://glosaapp.com/assets/Home-abc123.js",
        ),
      );

      expect(
        await screen.findByRole("heading", {
          name: "Hay una versión nueva de Glosa",
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/se ha actualizado mientras la usabas/),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: "Algo ha ido mal" }),
      ).not.toBeInTheDocument();
    });
  });
});

describe("Given the routes of the app", () => {
  describe("When the router is built", () => {
    it("Then every screen hangs from a root route with the error screen", () => {
      expect(appRoutes).toHaveLength(1);
      expect(appRoutes[0]?.errorElement).toBeDefined();
      expect(appRoutes[0]?.children).toBe(routes);
    });
  });
});
