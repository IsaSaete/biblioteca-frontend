import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../api/baseQueryWithReauth";
import type { Stats } from "./dto/Stats";

export const homeApi = createApi({
  reducerPath: "homeApi",
  baseQuery: baseQueryWithReauth,
  // Las cifras cambian al guardar o borrar libros y citas desde otras
  // pantallas: se piden de nuevo cada vez que se vuelve a Inicio.
  refetchOnMountOrArgChange: true,
  endpoints: (builder) => ({
    getStats: builder.query<Stats, void>({
      query: () => "/stats",
    }),
  }),
});

export const { useGetStatsQuery } = homeApi;
