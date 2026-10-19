import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { createMemoryRouter, RouterProvider } from "react-router";
import type { RouteObject } from "react-router";
import { createStore } from "../store/store";

export const renderRoutes = (
  routes: RouteObject[],
  initialEntries: string[],
) => {
  const router = createMemoryRouter(routes, { initialEntries });

  render(
    <Provider store={createStore()}>
      <RouterProvider router={router} />
    </Provider>,
  );

  return { user: userEvent.setup(), router };
};
