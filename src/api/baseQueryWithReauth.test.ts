import type { BaseQueryApi } from "@reduxjs/toolkit/query/react";
import { http, HttpResponse } from "msw";
import { server } from "../test/server";
import { createBaseQueryWithReauth } from "./baseQueryWithReauth";

const baseUrl = import.meta.env.VITE_API_URL ?? "";
const unauthenticated = () =>
  HttpResponse.json(
    { error: { code: "AUTH_UNAUTHENTICATED", message: "Sin sesión" } },
    { status: 401 },
  );

const buildApi = (): BaseQueryApi => ({
  signal: new AbortController().signal,
  abort: () => undefined,
  dispatch: () => undefined,
  getState: () => ({}),
  extra: undefined,
  endpoint: "test",
  type: "query",
});

const setup = () => {
  const onSessionLost = vi.fn();
  const baseQuery = createBaseQueryWithReauth({ baseUrl, onSessionLost });

  return { onSessionLost, baseQuery };
};

describe("Given the session base query", () => {
  beforeEach(() => {
    document.cookie = "csrfToken=csrf-123";
  });

  describe("When a request that modifies data with a session is sent", () => {
    it("Then it carries the X-CSRF-Token header with the csrfToken cookie", async () => {
      let header: string | null = null;
      server.use(
        http.post(`${baseUrl}/auth/logout`, ({ request }) => {
          header = request.headers.get("X-CSRF-Token");
          return new HttpResponse(null, { status: 204 });
        }),
      );
      const { baseQuery } = setup();

      await baseQuery({ url: "/auth/logout", method: "POST" }, buildApi(), {});

      expect(header).toBe("csrf-123");
    });
  });

  describe("When the login request is sent", () => {
    it("Then it does not carry the X-CSRF-Token header", async () => {
      let header: string | null = "not-read";
      server.use(
        http.post(`${baseUrl}/auth/login`, ({ request }) => {
          header = request.headers.get("X-CSRF-Token");
          return HttpResponse.json({ user: {} });
        }),
      );
      const { baseQuery } = setup();

      await baseQuery({ url: "/auth/login", method: "POST" }, buildApi(), {});

      expect(header).toBeNull();
    });
  });

  describe("When a request gets AUTH_UNAUTHENTICATED and the refresh works", () => {
    it("Then the session is refreshed once and the request is repeated", async () => {
      let attempts = 0;
      let refreshes = 0;
      server.use(
        http.get(`${baseUrl}/books`, () => {
          attempts += 1;
          return attempts === 1
            ? unauthenticated()
            : HttpResponse.json({ items: [] });
        }),
        http.post(`${baseUrl}/auth/refresh`, () => {
          refreshes += 1;
          return HttpResponse.json({});
        }),
      );
      const { baseQuery, onSessionLost } = setup();

      const result = await baseQuery("/books", buildApi(), {});

      expect(result.data).toEqual({ items: [] });
      expect(refreshes).toBe(1);
      expect(onSessionLost).not.toHaveBeenCalled();
    });
  });

  describe("When several requests get AUTH_UNAUTHENTICATED at the same time", () => {
    it("Then they share a single refresh", async () => {
      let refreshes = 0;
      let authorized = false;
      server.use(
        http.get(`${baseUrl}/books`, () =>
          authorized ? HttpResponse.json({ items: [] }) : unauthenticated(),
        ),
        http.post(`${baseUrl}/auth/refresh`, async () => {
          refreshes += 1;
          await new Promise((resolve) => setTimeout(resolve, 20));
          authorized = true;
          return HttpResponse.json({});
        }),
      );
      const { baseQuery } = setup();

      const results = await Promise.all([
        baseQuery("/books", buildApi(), {}),
        baseQuery("/books", buildApi(), {}),
        baseQuery("/books", buildApi(), {}),
      ]);

      expect(refreshes).toBe(1);
      expect(results.every((result) => !result.error)).toBe(true);
    });
  });

  describe("When the refresh fails", () => {
    it("Then the session is reported as lost and the original error is returned", async () => {
      server.use(
        http.get(`${baseUrl}/books`, unauthenticated),
        http.post(`${baseUrl}/auth/refresh`, unauthenticated),
      );
      const { baseQuery, onSessionLost } = setup();

      const result = await baseQuery("/books", buildApi(), {});

      expect(result.error?.status).toBe(401);
      expect(onSessionLost).toHaveBeenCalledTimes(1);
    });
  });

  describe("When /auth/me gets AUTH_UNAUTHENTICATED and the refresh fails", () => {
    it("Then it does not redirect, so RequireAuth can handle it", async () => {
      server.use(
        http.get(`${baseUrl}/auth/me`, unauthenticated),
        http.post(`${baseUrl}/auth/refresh`, unauthenticated),
      );
      const { baseQuery, onSessionLost } = setup();

      const result = await baseQuery("/auth/me", buildApi(), {});

      expect(result.error?.status).toBe(401);
      expect(onSessionLost).not.toHaveBeenCalled();
    });
  });

  describe("When the login gets 401 for wrong credentials", () => {
    it("Then no refresh is attempted", async () => {
      let refreshes = 0;
      server.use(
        http.post(`${baseUrl}/auth/login`, () =>
          HttpResponse.json(
            { error: { code: "AUTH_INVALID_CREDENTIALS", message: "No" } },
            { status: 401 },
          ),
        ),
        http.post(`${baseUrl}/auth/refresh`, () => {
          refreshes += 1;
          return HttpResponse.json({});
        }),
      );
      const { baseQuery } = setup();

      const result = await baseQuery(
        { url: "/auth/login", method: "POST" },
        buildApi(),
        {},
      );

      expect(result.error?.status).toBe(401);
      expect(refreshes).toBe(0);
    });
  });

  describe("When a request gets 403 CSRF_INVALID", () => {
    it("Then it is returned as is, without refreshing or retrying", async () => {
      let attempts = 0;
      let refreshes = 0;
      server.use(
        http.post(`${baseUrl}/books`, () => {
          attempts += 1;
          return HttpResponse.json(
            { error: { code: "CSRF_INVALID", message: "CSRF" } },
            { status: 403 },
          );
        }),
        http.post(`${baseUrl}/auth/refresh`, () => {
          refreshes += 1;
          return HttpResponse.json({});
        }),
      );
      const { baseQuery } = setup();

      const result = await baseQuery(
        { url: "/books", method: "POST" },
        buildApi(),
        {},
      );

      expect(result.error?.status).toBe(403);
      expect(attempts).toBe(1);
      expect(refreshes).toBe(0);
    });
  });

  describe("When a request gets AUTH_UNAUTHENTICATED and there is no csrfToken cookie", () => {
    it("Then no refresh is attempted, because without the cookie it could not work", async () => {
      document.cookie = "csrfToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      let refreshes = 0;
      server.use(
        http.get(`${baseUrl}/books`, unauthenticated),
        http.post(`${baseUrl}/auth/refresh`, () => {
          refreshes += 1;
          return HttpResponse.json({});
        }),
      );
      const { baseQuery, onSessionLost } = setup();

      const result = await baseQuery("/books", buildApi(), {});

      expect(result.error?.status).toBe(401);
      expect(refreshes).toBe(0);
      expect(onSessionLost).toHaveBeenCalledTimes(1);
    });
  });
});
