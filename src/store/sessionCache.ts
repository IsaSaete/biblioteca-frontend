import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import type { Dispatch, UnknownAction } from "@reduxjs/toolkit";
import { authApi } from "../domains/auth/authApi";
import { booksApi } from "../domains/books/booksApi";
import { homeApi } from "../domains/home/homeApi";
import { quotesApi } from "../domains/quotes/quotesApi";
import { wishlistApi } from "../domains/wishlist/wishlistApi";

// Biblioteca, citas y cifras son de quien tiene la sesión: si sobrevivieran a
// un cambio de cuenta, la siguiente persona vería las listas de la anterior
// mientras dura la caché (RTK Query guarda 60 s lo que nadie está mirando). La
// sesión (`authApi`) se trata aparte porque `me` la repone el propio login.
export const resetListCaches = (dispatch: Dispatch<UnknownAction>): void => {
  dispatch(booksApi.util.resetApiState());
  dispatch(quotesApi.util.resetApiState());
  dispatch(homeApi.util.resetApiState());
  dispatch(wishlistApi.util.resetApiState());
};

// Se vacían en cuanto la sesión cambia de manos o termina, vengan de donde
// vengan: iniciar sesión, crear una cuenta, cerrarla o eliminarla. Una caché por
// pantalla no basta: el registro llega sin pasar por el login.
export const createSessionCacheMiddleware = () => {
  const listener = createListenerMiddleware();

  listener.startListening({
    matcher: isAnyOf(
      authApi.endpoints.login.matchFulfilled,
      authApi.endpoints.register.matchFulfilled,
      authApi.endpoints.logout.matchFulfilled,
      authApi.endpoints.deleteAccount.matchFulfilled,
    ),
    effect: (_action, { dispatch }) => {
      resetListCaches(dispatch);
    },
  });

  return listener.middleware;
};
