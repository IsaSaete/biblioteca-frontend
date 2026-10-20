import type { ExternalBook } from "./ExternalBook";

// `book` ya guardado: la forma externa más `id`; la editorial siempre está.
export interface SavedBook extends ExternalBook {
  id: string;
  publisher: string;
}
