import type { SavedBook } from "../../books/dto/SavedBook";

// Un deseado: el libro (sin ejemplar, un deseado no tiene estado ni datos
// propios) y su nota. `note` se omite mientras esté vacía.
export interface WishlistItem {
  id: string;
  book: SavedBook;
  note?: string;
  createdAt: string;
}
