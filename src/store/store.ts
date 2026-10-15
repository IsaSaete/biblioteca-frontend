import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../domains/auth/authApi";

export const createStore = () =>
  configureStore({
    reducer: { [authApi.reducerPath]: authApi.reducer },
    middleware: (getDefault) => getDefault().concat(authApi.middleware),
  });

export const store = createStore();
