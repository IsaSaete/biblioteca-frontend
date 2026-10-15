import { createBrowserRouter, Navigate } from "react-router";
import RegisterPage from "../domains/auth/pages/RegisterPage/RegisterPage";

export const routes = [
  { path: "/", element: <Navigate to="/register" replace /> },
  { path: "/register", element: <RegisterPage /> },
];

export const router = createBrowserRouter(routes);
