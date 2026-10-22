import type { Quote } from "./Quote";

// `total` cuenta todas las citas que cumplen el filtro, no solo las de la tanda.
export interface GetQuotesResponse {
  items: Quote[];
  nextCursor: string | null;
  total: number;
}
