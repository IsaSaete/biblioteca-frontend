// Body de PATCH /quotes/:id: solo cambia lo que se envía, y `null` borra la
// página o la fuente (api-contract.md, `quotes`). El texto no admite `null` y
// la fuente solo existe en citas sin libro.
export interface UpdateQuoteRequest {
  text?: string;
  page?: number | null;
  source?: string | null;
}
