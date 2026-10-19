import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../api/baseQueryWithReauth";
import type { ForgotPasswordRequest } from "./dto/ForgotPasswordRequest";
import type { LoginRequest } from "./dto/LoginRequest";
import type { RegisterRequest } from "./dto/RegisterRequest";
import type { RegisterResponse } from "./dto/RegisterResponse";
import type { ResetPasswordRequest } from "./dto/ResetPasswordRequest";
import type { SessionResponse } from "./dto/SessionResponse";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Session"],
  endpoints: (builder) => ({
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
      invalidatesTags: ["Session"],
    }),
    login: builder.mutation<SessionResponse, LoginRequest>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      invalidatesTags: ["Session"],
    }),
    // useMeQuery es la única fuente de verdad de la sesión (arquitectura-tecnica.md).
    me: builder.query<SessionResponse, void>({
      query: () => "/auth/me",
      providesTags: ["Session"],
    }),
    forgotPassword: builder.mutation<void, ForgotPasswordRequest>({
      query: (body) => ({ url: "/auth/forgot-password", method: "POST", body }),
    }),
    resetPassword: builder.mutation<void, ResetPasswordRequest>({
      query: (body) => ({ url: "/auth/reset-password", method: "POST", body }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(authApi.util.resetApiState());
        } catch {
          // Si el logout falla se conserva la sesión en pantalla; el error
          // llega al componente por el estado de la mutación.
        }
      },
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useMeQuery,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
