import { createBrowserRouter, Navigate } from "react-router";
import LoginPage from "../domains/auth/pages/LoginPage/LoginPage";
import ForgotPasswordPage from "../domains/auth/pages/ForgotPasswordPage/ForgotPasswordPage";
import RegisterPage from "../domains/auth/pages/RegisterPage/RegisterPage";
import ResetPasswordPage from "../domains/auth/pages/ResetPasswordPage/ResetPasswordPage";
import LibraryPage from "../domains/books/pages/LibraryPage/LibraryPage";
import ProfilePage from "../domains/profile/pages/ProfilePage/ProfilePage";
import RequireAuth from "./RequireAuth/RequireAuth";

// Login y registro son las páginas de entrada y van en el bundle principal; el
// resto de rutas públicas se descarga solo cuando se visita.
export const routes = [
  { path: "/", element: <Navigate to="/library" replace /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  {
    element: <RequireAuth />,
    children: [
      { path: "/library", element: <LibraryPage /> },
      { path: "/profile", element: <ProfilePage /> },
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
