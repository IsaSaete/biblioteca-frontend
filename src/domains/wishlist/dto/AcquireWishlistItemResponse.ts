import type { BookEntry } from "../../books/dto/BookEntry";

// POST /wishlist/:id/acquire: la misma forma que POST /books.
export type AcquireWishlistItemResponse = BookEntry;
