// Body de PATCH /quotes/:id: solo cambia lo que se envía, y `page: null` borra
// la página (api-contract.md, `quotes`). El texto no admite `null`.
export interface UpdateQuoteRequest {
  text?: string;
  page?: number | null;
}
