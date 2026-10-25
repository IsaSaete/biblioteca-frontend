import { createBrowserRouter, Navigate } from "react-router";
import AppLayout from "../components/navigation/AppLayout/AppLayout";
import LoginPage from "../domains/auth/pages/LoginPage/LoginPage";
import ForgotPasswordPage from "../domains/auth/pages/ForgotPasswordPage/ForgotPasswordPage";
import RegisterPage from "../domains/auth/pages/RegisterPage/RegisterPage";
import ResetPasswordPage from "../domains/auth/pages/ResetPasswordPage/ResetPasswordPage";
import HomePage from "../domains/home/pages/HomePage/HomePage";
import LibraryPage from "../domains/books/pages/LibraryPage/LibraryPage";
import QuotesPage from "../domains/quotes/pages/QuotesPage/QuotesPage";
import ProfilePage from "../domains/profile/pages/ProfilePage/ProfilePage";
import RequireAuth from "./RequireAuth/RequireAuth";

// Login y registro son las páginas de entrada y van en el bundle principal; el
// resto de rutas públicas se descarga solo cuando se visita.
export const routes = [
  { path: "/", element: <Navigate to="/home" replace /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  {
    path: "/verify-email",
    lazy: async () => ({
      Component: (
        await import("../domains/auth/pages/VerifyEmailPage/VerifyEmailPage")
      ).default,
    }),
  },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        path: "/onboarding",
        lazy: async () => ({
          Component: (
            await import("../domains/auth/pages/OnboardingPage/OnboardingPage")
          ).default,
        }),
      },
      // Ficha de libro: pantalla de detalle, sin barra de navegación inferior.
      {
        path: "/library/:bookId",
        lazy: async () => ({
          Component: (
            await import("../domains/books/pages/BookDetailPage/BookDetailPage")
          ).default,
        }),
      },
      // Citas del libro: pantalla de detalle, sin barra de navegación inferior.
      {
        path: "/library/:bookId/quotes",
        lazy: async () => ({
          Component: (
            await import("../domains/quotes/pages/BookQuotesPage/BookQuotesPage")
          ).default,
        }),
      },
      // Detalle de cita: pantalla de detalle, sin barra de navegación inferior.
      {
        path: "/quotes/:quoteId",
        lazy: async () => ({
          Component: (
            await import("../domains/quotes/pages/QuoteDetailPage/QuoteDetailPage")
          ).default,
        }),
      },
      {
        element: <AppLayout />,
        children: [
          { path: "/home", element: <HomePage /> },
          { path: "/library", element: <LibraryPage /> },
          { path: "/quotes", element: <QuotesPage /> },
          {
            path: "/profile",
            element: <ProfilePage />,
            handle: { topBar: false },
          },
        ],
      },
    ],
  },
  {
    path: "/terms",
    lazy: async () => ({
      Component: (await import("../domains/legal/pages/TermsPage/TermsPage"))
        .default,
    }),
  },
  {
    path: "/privacy",
    lazy: async () => ({
      Component: (
        await import("../domains/legal/pages/PrivacyPage/PrivacyPage")
      ).default,
    }),
  },
  {
    path: "*",
    lazy: async () => ({
      Component: (await import("../pages/NotFoundPage/NotFoundPage")).default,
    }),
  },
];

export const router = createBrowserRouter(routes);
