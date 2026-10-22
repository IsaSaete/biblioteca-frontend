import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../api/baseQueryWithReauth";
import type { CreateQuoteRequest } from "./dto/CreateQuoteRequest";
import type { GetQuotesParams } from "./dto/GetQuotesParams";
import type { GetQuotesResponse } from "./dto/GetQuotesResponse";
import type { Quote } from "./dto/Quote";

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
    createQuote: builder.mutation<Quote, CreateQuoteRequest>({
      query: (body) => ({ url: "/quotes", method: "POST", body }),
      transformResponse: (response: { quote: Quote }) => response.quote,
      invalidatesTags: ["Quote"],
    }),
  }),
});

export const { useGetQuotesQuery, useCreateQuoteMutation } = quotesApi;
