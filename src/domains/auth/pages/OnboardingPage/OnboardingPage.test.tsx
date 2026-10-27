import { fireEvent, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { renderRoutes } from "../../../../test/renderRoutes";
import { server } from "../../../../test/server";
import OnboardingPage from "./OnboardingPage";

const baseUrl = import.meta.env.VITE_API_URL;

const useSession = (onboardingCompleted?: boolean) =>
  server.use(
    http.get(`${baseUrl}/auth/me`, () =>
      HttpResponse.json({
        user: {
          id: "1",
          name: "Isa",
          email: "isa@example.com",
          onboardingCompleted,
        },
      }),
    ),
  );

const trackCompletion = (status = 204) => {
  const calls = { count: 0, csrfHeader: null as string | null };
  server.use(
    http.post(`${baseUrl}/auth/onboarding/complete`, ({ request }) => {
      calls.count += 1;
      calls.csrfHeader = request.headers.get("X-CSRF-Token");
      return status === 204
        ? new HttpResponse(null, { status })
        : HttpResponse.json({ error: { code: "X", message: "x" } }, { status });
    }),
  );

  return calls;
};

const renderPage = () =>
  renderRoutes(
    [
      { path: "/onboarding", element: <OnboardingPage /> },
      { path: "/home", element: <p>Inicio</p> },
    ],
    ["/onboarding"],
  );

describe("Given the onboarding page", () => {
  beforeEach(() => {
    document.cookie = "csrfToken=csrf-123";
  });

  describe("When it is shown for the first time", () => {
    it("Then it starts at the first step with the skip option visible", () => {
      useSession(false);

      renderPage();

      expect(
        screen.getByRole("heading", {
          name: "Cataloga tus libros en segundos",
        }),
      ).toBeInTheDocument();
      expect(screen.getByText("Paso 1 de 3")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Saltar" })).toBeVisible();
      expect(
        screen.queryByRole("button", { name: "Atrás" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("When the user advances through the steps", () => {
    it("Then the camera quotes step comes second and the last one offers to start", async () => {
      useSession(false);
      const { user } = renderPage();

      await user.click(screen.getByRole("button", { name: "Siguiente" }));
      expect(
        screen.getByRole("heading", {
          name: "Guarda tus citas con la cámara",
        }),
      ).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Siguiente" }));

      expect(
        screen.getByRole("heading", { name: "Organiza a tu manera" }),
      ).toBeInTheDocument();
      expect(screen.getByText("Paso 3 de 3")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Empezar" }),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Saltar" })).toBeVisible();
    });
  });

  describe("When the user goes back", () => {
    it("Then the previous step is shown", async () => {
      useSession(false);
      const { user } = renderPage();
      await user.click(screen.getByRole("button", { name: "Siguiente" }));

      await user.click(screen.getByRole("button", { name: "Atrás" }));

      expect(
        screen.getByRole("heading", {
          name: "Cataloga tus libros en segundos",
        }),
      ).toBeInTheDocument();
    });
  });

  describe("When the user swipes the content", () => {
    it("Then it moves to the next step when swiping left and back when swiping right", () => {
      useSession(false);
      renderPage();
      const step = screen.getByText("Paso 1 de 3").parentElement as HTMLElement;

      fireEvent.touchStart(step, { touches: [{ clientX: 200 }] });
      fireEvent.touchEnd(step, { changedTouches: [{ clientX: 100 }] });
      const afterLeft = screen.getByText("Paso 2 de 3");
      fireEvent.touchStart(step, { touches: [{ clientX: 100 }] });
      fireEvent.touchEnd(step, { changedTouches: [{ clientX: 200 }] });

      expect(afterLeft).toBeInTheDocument();
      expect(screen.getByText("Paso 1 de 3")).toBeInTheDocument();
    });

    it("Then a short movement does not change the step", () => {
      useSession(false);
      renderPage();
      const step = screen.getByText("Paso 1 de 3").parentElement as HTMLElement;

      fireEvent.touchStart(step, { touches: [{ clientX: 200 }] });
      fireEvent.touchEnd(step, { changedTouches: [{ clientX: 180 }] });

      expect(screen.getByText("Paso 1 de 3")).toBeInTheDocument();
    });
  });

  describe("When the user skips from the first step", () => {
    it("Then the onboarding is marked as seen and the user goes to the home screen", async () => {
      useSession(false);
      const calls = trackCompletion();
      const { user } = renderPage();

      await user.click(screen.getByRole("button", { name: "Saltar" }));

      expect(await screen.findByText("Inicio")).toBeInTheDocument();
      expect(calls.count).toBe(1);
      expect(calls.csrfHeader).toBe("csrf-123");
    });
  });

  describe("When the user completes the last step", () => {
    it("Then it ends in the same place and is marked as seen once", async () => {
      useSession(false);
      const calls = trackCompletion();
      const { user } = renderPage();
      await user.click(screen.getByRole("button", { name: "Siguiente" }));
      await user.click(screen.getByRole("button", { name: "Siguiente" }));

      await user.click(screen.getByRole("button", { name: "Empezar" }));

      expect(await screen.findByText("Inicio")).toBeInTheDocument();
      expect(calls.count).toBe(1);
    });
  });

  describe("When the user is on the first step", () => {
    it("Then it welcomes them by name and the greeting is not read on the other steps", async () => {
      useSession(false);
      const { user } = renderPage();

      const greeting = await screen.findByText("Te damos la bienvenida, Isa");
      await user.click(screen.getByRole("button", { name: "Siguiente" }));

      expect(greeting).toBeInTheDocument();
      expect(
        screen.queryByText("Te damos la bienvenida, Isa"),
      ).not.toBeVisible();
    });
  });

  describe("When marking the onboarding as seen fails", () => {
    it("Then the user still enters the app", async () => {
      useSession(false);
      trackCompletion(500);
      const { user } = renderPage();

      await user.click(screen.getByRole("button", { name: "Saltar" }));

      expect(await screen.findByText("Inicio")).toBeInTheDocument();
    });
  });

  describe("When the account has already seen the onboarding", () => {
    it("Then the user is sent to the home screen", async () => {
      useSession(true);

      renderPage();

      expect(await screen.findByText("Inicio")).toBeInTheDocument();
    });
  });
});
