import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../domains/auth/authApi";
import { booksApi } from "../domains/books/booksApi";

export const createStore = () =>
  configureStore({
    reducer: {
      [authApi.reducerPath]: authApi.reducer,
      [booksApi.reducerPath]: booksApi.reducer,
    },
    middleware: (getDefault) =>
      getDefault().concat(authApi.middleware, booksApi.middleware),
  });

export const store = createStore();
