import { createListenerMiddleware } from "@reduxjs/toolkit";
import { booksApi } from "../domains/books/booksApi";
import { wishlistApi } from "../domains/wishlist/wishlistApi";

// Al añadir un libro a la biblioteca, el backend retira el mismo libro de
// «Lista de deseos» (api-contract.md, `books`): la lista en caché ya no es cierta.
// Va aquí y no en `booksApi` porque `wishlistApi` ya depende de `booksApi`.
export const createWishlistInvalidationMiddleware = () => {
  const listener = createListenerMiddleware();

  listener.startListening({
    matcher: booksApi.endpoints.createBook.matchFulfilled,
    effect: (_action, { dispatch }) => {
      dispatch(wishlistApi.util.invalidateTags(["Wishlist"]));
    },
  });

  return listener.middleware;
};
