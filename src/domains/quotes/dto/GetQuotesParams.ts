// Sin filtros → feed completo; con `bookId` → solo las citas de ese libro; con
// `unlinked` → solo las citas sin libro (no se combinan).
export interface GetQuotesParams {
  bookId?: string;
  unlinked?: boolean;
  cursor?: string;
}
