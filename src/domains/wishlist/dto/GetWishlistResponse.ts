import type { WishlistItem } from "./WishlistItem";

// `total` es el número de deseados, no solo los de la tanda.
export interface GetWishlistResponse {
  items: WishlistItem[];
  nextCursor: string | null;
  total: number;
}
