// Sin `bookId` → feed completo; con `bookId` → solo las citas de ese libro.
export interface GetQuotesParams {
  bookId?: string;
  cursor?: string;
}
