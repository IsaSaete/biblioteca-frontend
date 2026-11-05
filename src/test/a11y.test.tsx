import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import type { ReactElement } from "react";
import { axe } from "vitest-axe";
import ForgotPasswordPage from "../domains/auth/pages/ForgotPasswordPage/ForgotPasswordPage";
import LoginPage from "../domains/auth/pages/LoginPage/LoginPage";
import RegisterPage from "../domains/auth/pages/RegisterPage/RegisterPage";
import PrivacyPage from "../domains/legal/pages/PrivacyPage/PrivacyPage";
import TermsPage from "../domains/legal/pages/TermsPage/TermsPage";
import QuoteDetailPage from "../domains/quotes/pages/QuoteDetailPage/QuoteDetailPage";
import { renderRoutes } from "./renderRoutes";
import { server } from "./server";

const baseUrl = import.meta.env.VITE_API_URL ?? "";

const mockQuoteDetail = () =>
  server.use(
    http.get(`${baseUrl}/quotes/q1`, () =>
      HttpResponse.json({
        quote: {
          id: "q1",
          ejemplarId: "ejemplar-1",
          text: "Muchos años después.",
          page: 9,
          createdAt: "2026-10-22T10:00:00.000Z",
          book: { id: "book-1", title: "1984", authors: ["George Orwell"] },
        },
      }),
    ),
    http.get(`${baseUrl}/books/book-1`, () =>
      HttpResponse.json({
        book: {
          id: "book-1",
          title: "1984",
          authors: ["George Orwell"],
          publisher: "Debolsillo",
        },
        ejemplar: {
          id: "ejemplar-1",
          bookId: "book-1",
          status: "reading",
          createdAt: "2026-10-20T10:00:00.000Z",
        },
      }),
    ),
  );

interface Screen {
  name: string;
  path: string;
  route: string;
  element: ReactElement;
  ready: string | RegExp;
  setup?: () => void;
}

// jsdom no calcula contraste ni maquetación (eso se revisa en el navegador);
// esto vigila lo demás: nombres accesibles, roles, encabezados y landmarks.
const screens: Screen[] = [
  {
    name: "login",
    path: "/login",
    route: "/login",
    element: <LoginPage />,
    ready: /entrar|iniciar sesión/i,
  },
  {
    name: "register",
    path: "/register",
    route: "/register",
    element: <RegisterPage />,
    ready: /crear cuenta/i,
  },
  {
    name: "forgot password",
    path: "/forgot-password",
    route: "/forgot-password",
    element: <ForgotPasswordPage />,
    ready: /contraseña/i,
  },
  {
    name: "terms",
    path: "/terms",
    route: "/terms",
    element: <TermsPage />,
    ready: /.+/,
  },
  {
    name: "privacy",
    path: "/privacy",
    route: "/privacy",
    element: <PrivacyPage />,
    ready: /.+/,
  },
  {
    name: "quote detail",
    path: "/quotes/:quoteId",
    route: "/quotes/q1",
    element: <QuoteDetailPage />,
    ready: "Cita de 1984",
    setup: mockQuoteDetail,
  },
];

describe("Given each screen of the app", () => {
  it.each(screens)(
    "When $name is rendered Then it has no accessibility violations",
    async ({ path, route, element, ready, setup }) => {
      setup?.();

      renderRoutes([{ path, element }], [route]);

      await screen.findAllByText(ready);
      const container = document.body;
      expect(await axe(container)).toHaveNoViolations();
    },
  );
});
