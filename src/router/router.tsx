import { createBrowserRouter, Navigate } from "react-router";
import RegisterPage from "../domains/auth/pages/RegisterPage/RegisterPage";

// La página de registro es la de entrada y va en el bundle principal. El resto
// se descarga solo cuando se visita.
export const routes = [
  { path: "/", element: <Navigate to="/register" replace /> },
  { path: "/register", element: <RegisterPage /> },
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
