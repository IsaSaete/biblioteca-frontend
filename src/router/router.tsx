import { createBrowserRouter, Navigate } from "react-router";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import PrivacyPage from "../domains/legal/pages/PrivacyPage/PrivacyPage";
import TermsPage from "../domains/legal/pages/TermsPage/TermsPage";
import RegisterPage from "../domains/auth/pages/RegisterPage/RegisterPage";

export const routes = [
  { path: "/", element: <Navigate to="/register" replace /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/terms", element: <TermsPage /> },
  { path: "/privacy", element: <PrivacyPage /> },
  { path: "*", element: <NotFoundPage /> },
];

export const router = createBrowserRouter(routes);
