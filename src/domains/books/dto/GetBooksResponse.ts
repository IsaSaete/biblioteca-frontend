import type { BookEntry } from "./BookEntry";

export interface GetBooksResponse {
  items: BookEntry[];
  nextCursor: string | null;
}
