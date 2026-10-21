import type { BookFormat } from "./BookFormat";
import type { BookOverrides } from "./Ejemplar";
import type { BookProvenance } from "./BookProvenance";
import type { BookStatus } from "./BookStatus";

// Body de PATCH /books/:id/ejemplar: solo cambia lo que se envía, y `null`
// borra el campo (api-contract.md, `books`).
export interface UpdateEjemplarRequest {
  status?: BookStatus;
  favorite?: boolean;
  location?: string | null;
  format?: BookFormat | null;
  provenance?: BookProvenance | null;
  acquisitionDate?: string | null;
  notes?: string | null;
  tags?: string[];
  overrides?: {
    [Key in keyof BookOverrides]: BookOverrides[Key] | null;
  };
}
