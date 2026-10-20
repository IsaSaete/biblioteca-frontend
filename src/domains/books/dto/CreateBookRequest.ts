import type { BookStatus } from "./BookStatus";
import type { ExternalBook } from "./ExternalBook";

// POST /books: la editorial es obligatoria y `coverUrl` y `coverSource` van
// juntos o ninguno.
export type CreateBookRequest = Omit<ExternalBook, "publisher"> & {
  publisher: string;
  status?: BookStatus;
};
