import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { parseApiError } from "../domains/auth/utils/parseApiError";
import { readCookie } from "../utils/readCookie";

// Rutas sin sesión previa: no llevan X-CSRF-Token (api-contract.md, Sesión).
const sessionlessPaths = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
];
const noReauthPaths = [...sessionlessPaths, "/auth/refresh", "/auth/logout"];
const safeMethods = ["GET", "HEAD", "OPTIONS"];

const toFetchArgs = (args: string | FetchArgs): FetchArgs =>
  typeof args === "string" ? { url: args } : args;

const needsCsrfHeader = ({ url, method = "GET" }: FetchArgs): boolean =>
  !safeMethods.includes(method.toUpperCase()) &&
  !sessionlessPaths.includes(url);

const isUnauthenticated = (error: FetchBaseQueryError | undefined): boolean =>
  error?.status === 401 &&
  parseApiError(error)?.code === "AUTH_UNAUTHENTICATED";

interface BaseQueryWithReauthOptions {
  baseUrl: string;
  onSessionLost: () => void;
}

export const createBaseQueryWithReauth = ({
  baseUrl,
  onSessionLost,
}: BaseQueryWithReauthOptions): BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> => {
  const rawBaseQuery = fetchBaseQuery({ baseUrl, credentials: "include" });

  const baseQueryWithCsrf: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
  > = (args, api, extraOptions) => {
    const request = toFetchArgs(args);
    const csrfToken = needsCsrfHeader(request)
      ? readCookie("csrfToken")
      : undefined;

    return rawBaseQuery(
      csrfToken
        ? {
            ...request,
            headers: { ...request.headers, "X-CSRF-Token": csrfToken },
          }
        : request,
      api,
      extraOptions,
    );
  };

  // El refresh token se rota en cada uso y reutilizar uno viejo revoca todas
  // las sesiones: con varias peticiones fallando a la vez solo puede haber un
  // refresh en vuelo, que todas comparten.
  let refreshInFlight: Promise<boolean> | null = null;

  const refreshSession: BaseQueryFn<void, boolean, never> = (
    _arg,
    api,
    extraOptions,
  ) => {
    refreshInFlight ??= Promise.resolve(
      baseQueryWithCsrf(
        { url: "/auth/refresh", method: "POST" },
        api,
        extraOptions,
      ),
    )
      .then((result) => !result.error)
      .finally(() => {
        refreshInFlight = null;
      });

    return refreshInFlight.then((data) => ({ data }));
  };

  return async (args, api, extraOptions) => {
    const request = toFetchArgs(args);
    const result = await baseQueryWithCsrf(request, api, extraOptions);

    if (
      !isUnauthenticated(result.error) ||
      noReauthPaths.includes(request.url)
    ) {
      return result;
    }

    const refreshed = await refreshSession(undefined, api, extraOptions);

    if (refreshed.data) {
      return baseQueryWithCsrf(request, api, extraOptions);
    }

    // /auth/me lo gestiona RequireAuth; para el resto, la sesión se perdió a
    // mitad de uso.
    if (request.url !== "/auth/me") {
      onSessionLost();
    }

    return result;
  };
};

export const baseQueryWithReauth = createBaseQueryWithReauth({
  baseUrl: import.meta.env.VITE_API_URL || "/api",
  onSessionLost: () => window.location.assign("/login"),
});
