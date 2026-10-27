import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../domains/auth/authApi";
import { booksApi } from "../domains/books/booksApi";
import { homeApi } from "../domains/home/homeApi";
import { quotesApi } from "../domains/quotes/quotesApi";
import { createSessionCacheMiddleware } from "./sessionCache";

export const createStore = () =>
  configureStore({
    reducer: {
      [authApi.reducerPath]: authApi.reducer,
      [booksApi.reducerPath]: booksApi.reducer,
      [homeApi.reducerPath]: homeApi.reducer,
      [quotesApi.reducerPath]: quotesApi.reducer,
    },
    middleware: (getDefault) =>
      getDefault()
        .prepend(createSessionCacheMiddleware())
        .concat(
          authApi.middleware,
          booksApi.middleware,
          homeApi.middleware,
          quotesApi.middleware,
        ),
  });

export const store = createStore();
