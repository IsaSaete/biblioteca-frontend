import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../api/baseQueryWithReauth";
import type { CreateQuoteRequest } from "./dto/CreateQuoteRequest";
import type { GetQuotesParams } from "./dto/GetQuotesParams";
import type { GetQuotesResponse } from "./dto/GetQuotesResponse";
import type { Quote } from "./dto/Quote";
import type { GetQuoteBooksResponse } from "./dto/GetQuoteBooksResponse";
import type { UpdateQuoteRequest } from "./dto/UpdateQuoteRequest";

export const quotesApi = createApi({
  reducerPath: "quotesApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Quote"],
  endpoints: (builder) => ({
    // Tandas fijas de 24, la más reciente primero; `nextCursor` es opaco.
    getQuotes: builder.query<GetQuotesResponse, GetQuotesParams | void>({
      query: (params) => ({ url: "/quotes", params: params ?? undefined }),
      providesTags: ["Quote"],
    }),
    // Alimenta el filtro por libro: solo libros con citas, por título.
    getQuoteBooks: builder.query<GetQuoteBooksResponse, void>({
      query: () => "/quotes/books",
      providesTags: ["Quote"],
    }),
    getQuote: builder.query<Quote, string>({
      query: (quoteId) => `/quotes/${encodeURIComponent(quoteId)}`,
      transformResponse: (response: { quote: Quote }) => response.quote,
      providesTags: (_result, _error, quoteId) => [
        { type: "Quote", id: quoteId },
      ],
    }),
    createQuote: builder.mutation<Quote, CreateQuoteRequest>({
      query: (body) => ({ url: "/quotes", method: "POST", body }),
      transformResponse: (response: { quote: Quote }) => response.quote,
      invalidatesTags: ["Quote"],
    }),
    updateQuote: builder.mutation<
      Quote,
      { quoteId: string; changes: UpdateQuoteRequest }
    >({
      query: ({ quoteId, changes }) => ({
        url: `/quotes/${encodeURIComponent(quoteId)}`,
        method: "PATCH",
        body: changes,
      }),
      transformResponse: (response: { quote: Quote }) => response.quote,
      invalidatesTags: ["Quote"],
    }),
    deleteQuote: builder.mutation<void, string>({
      query: (quoteId) => ({
        url: `/quotes/${encodeURIComponent(quoteId)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Quote"],
    }),
  }),
});

export const {
  useGetQuotesQuery,
  useGetQuoteQuery,
  useGetQuoteBooksQuery,
  useCreateQuoteMutation,
  useUpdateQuoteMutation,
  useDeleteQuoteMutation,
} = quotesApi;
