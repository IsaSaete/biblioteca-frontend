import type { ExternalBook } from "./ExternalBook";

export interface SearchExternalResponse {
  results: { book: ExternalBook }[];
}
