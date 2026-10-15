import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RegisterRequest } from "./dto/RegisterRequest";
import type { RegisterResponse } from "./dto/RegisterResponse";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
    }),
  }),
});

export const { useRegisterMutation } = authApi;
