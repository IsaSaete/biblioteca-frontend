import type { QuoteBook } from "./QuoteBook";

// `unlinkedCount` es el número de citas sin libro (0 si no hay).
export interface GetQuoteBooksResponse {
  items: QuoteBook[];
  unlinkedCount: number;
}
