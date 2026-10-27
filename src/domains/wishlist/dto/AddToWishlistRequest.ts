import type { ExternalBook } from "../../books/dto/ExternalBook";

// POST /wishlist: los campos de POST /books salvo `status`, más la nota.
export type AddToWishlistRequest = Omit<ExternalBook, "publisher"> & {
  publisher: string;
  note?: string;
};
