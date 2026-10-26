import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../api/baseQueryWithReauth";
import type { ForgotPasswordRequest } from "./dto/ForgotPasswordRequest";
import type { LoginRequest } from "./dto/LoginRequest";
import type { RegisterRequest } from "./dto/RegisterRequest";
import type { RegisterResponse } from "./dto/RegisterResponse";
import type { ResetPasswordRequest } from "./dto/ResetPasswordRequest";
import type { SessionResponse } from "./dto/SessionResponse";
import type { ChangeEmailRequest } from "./dto/ChangeEmailRequest";
import type { DeleteAccountRequest } from "./dto/DeleteAccountRequest";
import type { ChangePasswordRequest } from "./dto/ChangePasswordRequest";
import type { UpdateProfileRequest } from "./dto/UpdateProfileRequest";
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
    // Cambia el nombre de la cuenta. La sesión en caché toma el usuario que
    // devuelve el servidor, sin pedir `/auth/me` otra vez.
    updateProfile: builder.mutation<SessionResponse, UpdateProfileRequest>({
      query: (body) => ({ url: "/auth/me", method: "PATCH", body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            authApi.util.updateQueryData("me", undefined, (session) => {
              session.user = { ...session.user, ...data.user };
            }),
          );
        } catch {
          // El formulario enseña el error; la sesión sigue como estaba.
        }
      },
    }),
    // Sube la foto de perfil, ya reducida a JPEG (D-032). La sesión en caché
    // toma el usuario que devuelve el servidor, con su `avatarUrl` nuevo.
    uploadAvatar: builder.mutation<SessionResponse, Blob>({
      query: (photo) => ({
        url: "/auth/me/avatar",
        method: "PUT",
        body: photo,
        headers: { "Content-Type": "image/jpeg" },
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            authApi.util.updateQueryData("me", undefined, (session) => {
              session.user = { ...session.user, ...data.user };
            }),
          );
        } catch {
          // La pantalla enseña el error; la sesión sigue como estaba.
        }
      },
    }),
    removeAvatar: builder.mutation<void, void>({
      query: () => ({ url: "/auth/me/avatar", method: "DELETE" }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            authApi.util.updateQueryData("me", undefined, (session) => {
              session.user.avatarUrl = null;
            }),
          );
        } catch {
          // La pantalla enseña el error; la sesión sigue como estaba.
        }
      },
    }),
    // Descarga todos los datos de la cuenta (HU-38). Es una mutación para que se
    // pida cada vez que se pulsa y no quede nada en la caché. El archivo llega
    // como `Blob`; un fallo trae el JSON de error del servidor.
    exportData: builder.mutation<Blob, void>({
      query: () => ({
        url: "/auth/me/export",
        responseHandler: async (response) =>
          response.ok
            ? response.blob()
            : response.json().catch(() => undefined),
      }),
    }),
    // Elimina la cuenta y todos sus datos (HU-39). El servidor limpia las
    // cookies; la caché de la sesión se descarta al llegar al login.
    deleteAccount: builder.mutation<void, DeleteAccountRequest>({
      query: (body) => ({ url: "/auth/me", method: "DELETE", body }),
    }),
    changePassword: builder.mutation<void, ChangePasswordRequest>({
      query: (body) => ({ url: "/auth/me/password", method: "POST", body }),
    }),
    // Pide cambiar el email: el servidor manda un enlace al email nuevo y no
    // cambia nada hasta que se confirma.
    requestEmailChange: builder.mutation<void, ChangeEmailRequest>({
      query: (body) => ({ url: "/auth/me/email", method: "POST", body }),
    }),
    // Destino del enlace del correo (`/confirm-email-change?token=`). Como el
    // de verificación, el token es de un solo uso y el resultado se queda en
    // caché.
    confirmEmailChange: builder.query<void, string>({
      query: (token) => ({
        url: "/auth/confirm-email-change",
        params: { token },
      }),
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
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useRemoveAvatarMutation,
  useExportDataMutation,
  useDeleteAccountMutation,
  useChangePasswordMutation,
  useRequestEmailChangeMutation,
  useConfirmEmailChangeQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
