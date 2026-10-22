// Un libro con al menos una cita y cuántas tiene (GET /quotes/books); `title`
// ya lleva los overrides aplicados.
export interface QuoteBook {
  bookId: string;
  title: string;
  count: number;
}
