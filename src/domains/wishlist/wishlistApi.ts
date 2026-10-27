import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../api/baseQueryWithReauth";
import { booksApi } from "../books/booksApi";
import type { BookStatus } from "../books/dto/BookStatus";
import type { LibraryBook } from "../books/dto/LibraryBook";
import { mapBookEntryToLibraryBook } from "../books/utils/mapBookEntryToLibraryBook";
import type { AcquireWishlistItemResponse } from "./dto/AcquireWishlistItemResponse";
import type { AddToWishlistRequest } from "./dto/AddToWishlistRequest";
import type { GetWishlistResponse } from "./dto/GetWishlistResponse";
import type { WishlistItem } from "./dto/WishlistItem";

export const wishlistApi = createApi({
  reducerPath: "wishlistApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Wishlist"],
  endpoints: (builder) => ({
    // Tandas fijas de 24; `nextCursor` es opaco y `null` indica que no hay más.
    getWishlist: builder.query<GetWishlistResponse, { cursor?: string } | void>(
      {
        query: (params) => ({ url: "/wishlist", params: params ?? undefined }),
        providesTags: ["Wishlist"],
      },
    ),
    addToWishlist: builder.mutation<WishlistItem, AddToWishlistRequest>({
      query: (body) => ({ url: "/wishlist", method: "POST", body }),
      transformResponse: (response: { item: WishlistItem }) => response.item,
      invalidatesTags: ["Wishlist"],
    }),
    // Una nota vacía la borra en el servidor.
    updateWishlistNote: builder.mutation<
      WishlistItem,
      { id: string; note: string | null }
    >({
      query: ({ id, note }) => ({
        url: `/wishlist/${encodeURIComponent(id)}`,
        method: "PATCH",
        body: { note },
      }),
      transformResponse: (response: { item: WishlistItem }) => response.item,
      invalidatesTags: ["Wishlist"],
    }),
    removeFromWishlist: builder.mutation<void, string>({
      query: (id) => ({
        url: `/wishlist/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Wishlist"],
    }),
    // «Ya lo tengo»: el deseado pasa a la biblioteca, así que la lista de
    // libros cambia (las cifras de Inicio se piden de nuevo al volver a ella).
    acquireWishlistItem: builder.mutation<
      LibraryBook,
      { id: string; status?: BookStatus }
    >({
      query: ({ id, status }) => ({
        url: `/wishlist/${encodeURIComponent(id)}/acquire`,
        method: "POST",
        body: status ? { status } : {},
      }),
      transformResponse: (response: AcquireWishlistItemResponse) =>
        mapBookEntryToLibraryBook(response),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(booksApi.util.invalidateTags(["Book"]));
        } catch {
          // Sin cambios que reflejar si el servidor rechaza la petición.
        }
      },
      invalidatesTags: ["Wishlist"],
    }),
  }),
});

export const {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useUpdateWishlistNoteMutation,
  useRemoveFromWishlistMutation,
  useAcquireWishlistItemMutation,
} = wishlistApi;
