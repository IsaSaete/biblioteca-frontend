import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../api/baseQueryWithReauth";
import type { BookEntry } from "./dto/BookEntry";
import type { CreateBookRequest } from "./dto/CreateBookRequest";
import type { ExternalBook } from "./dto/ExternalBook";
import type { GetBooksParams } from "./dto/GetBooksParams";
import type { GetBooksResponse } from "./dto/GetBooksResponse";
import type { LibraryBook } from "./dto/LibraryBook";
import type { LookupIsbnResponse } from "./dto/LookupIsbnResponse";
import type { SearchExternalResponse } from "./dto/SearchExternalResponse";
import { mapBookEntryToLibraryBook } from "./utils/mapBookEntryToLibraryBook";

export interface BooksPage {
  items: LibraryBook[];
  nextCursor: string | null;
}

export const booksApi = createApi({
  reducerPath: "booksApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Book"],
  endpoints: (builder) => ({
    // Tandas fijas de 24; `nextCursor` es opaco y `null` indica que no hay más.
    getBooks: builder.query<BooksPage, GetBooksParams | void>({
      query: (params) => ({ url: "/books", params: params ?? undefined }),
      transformResponse: (response: GetBooksResponse): BooksPage => ({
        items: response.items.map(mapBookEntryToLibraryBook),
        nextCursor: response.nextCursor,
      }),
      providesTags: ["Book"],
    }),
    getBook: builder.query<LibraryBook, string>({
      query: (bookId) => `/books/${encodeURIComponent(bookId)}`,
      transformResponse: (response: BookEntry) =>
        mapBookEntryToLibraryBook(response),
      providesTags: (_result, _error, bookId) => [{ type: "Book", id: bookId }],
    }),
    // Cada consulta gasta cuota del proveedor (30/min por usuario): se usan los
    // hooks `lazy` para lanzarlas solo con un ISBN completo, y la caché evita
    // repetir la misma consulta.
    lookupIsbn: builder.query<ExternalBook, string>({
      query: (isbn) => ({ url: "/books/lookup-isbn", params: { isbn } }),
      transformResponse: (response: LookupIsbnResponse) => response.book,
    }),
    searchExternal: builder.query<ExternalBook[], string>({
      query: (q) => ({ url: "/books/search-external", params: { q } }),
      transformResponse: (response: SearchExternalResponse) =>
        response.results.map(({ book }) => book),
    }),
    createBook: builder.mutation<LibraryBook, CreateBookRequest>({
      query: (body) => ({ url: "/books", method: "POST", body }),
      transformResponse: (response: BookEntry) =>
        mapBookEntryToLibraryBook(response),
      invalidatesTags: ["Book"],
    }),
  }),
});

export const {
  useGetBooksQuery,
  useGetBookQuery,
  useLazyLookupIsbnQuery,
  useSearchExternalQuery,
  useCreateBookMutation,
} = booksApi;
