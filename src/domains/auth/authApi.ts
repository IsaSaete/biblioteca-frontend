import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../api/baseQueryWithReauth";
import type { ForgotPasswordRequest } from "./dto/ForgotPasswordRequest";
import type { LoginRequest } from "./dto/LoginRequest";
import type { RegisterRequest } from "./dto/RegisterRequest";
import type { RegisterResponse } from "./dto/RegisterResponse";
import type { ResetPasswordRequest } from "./dto/ResetPasswordRequest";
import type { SessionResponse } from "./dto/SessionResponse";
import type { UpdatePreferencesRequest } from "./dto/UpdatePreferencesRequest";
import type { UserPreferences } from "./dto/UserPreferences";

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
    // El token del enlace del correo es de un solo uso: una segunda petición
    // con el mismo token falla, así que el resultado se queda en caché.
    verifyEmail: builder.query<void, string>({
      query: (token) => ({ url: "/auth/verify-email", params: { token } }),
    }),
    forgotPassword: builder.mutation<void, ForgotPasswordRequest>({
      query: (body) => ({ url: "/auth/forgot-password", method: "POST", body }),
    }),
    resetPassword: builder.mutation<void, ResetPasswordRequest>({
      query: (body) => ({ url: "/auth/reset-password", method: "POST", body }),
    }),
    // Marca el onboarding como visto (completado o saltado). La caché se
    // actualiza sin esperar ni revertir si falla: un fallo del servidor no debe
    // atrapar al usuario en el onboarding (D-016); la próxima vez se mostrará
    // otra vez.
    completeOnboarding: builder.mutation<void, void>({
      query: () => ({ url: "/auth/onboarding/complete", method: "POST" }),
      onQueryStarted(_arg, { dispatch }) {
        dispatch(
          authApi.util.updateQueryData("me", undefined, (session) => {
            session.user.onboardingCompleted = true;
          }),
        );
      },
    }),
    // Guarda las preferencias de la cuenta (D-029). Se aplican a la sesión en
    // caché al momento, para que el cambio se vea sin esperar, y se revierten si
    // el servidor falla.
    updatePreferences: builder.mutation<
      { preferences: UserPreferences },
      UpdatePreferencesRequest
    >({
      query: (body) => ({
        url: "/auth/me/preferences",
        method: "PATCH",
        body,
      }),
      async onQueryStarted(changes, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          authApi.util.updateQueryData("me", undefined, (session) => {
            session.user.preferences = {
              libraryView: "grid",
              ...session.user.preferences,
              ...changes,
            };
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
    // La caché se vacía al entrar en el login (ver LoginPage): vaciarla con la
    // página anterior montada hace que `useMeQuery` vuelva a pedir /auth/me al
    // instante, sin sesión.
    logout: builder.mutation<void, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useMeQuery,
  useLogoutMutation,
  useVerifyEmailQuery,
  useCompleteOnboardingMutation,
  useUpdatePreferencesMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
