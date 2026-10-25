export interface BookTag {
  tag: string;
  count: number;
}

// Etiquetas en uso, por `count` descendente. `untaggedCount` alimenta
// «Sin catalogar».
export interface GetBookTagsResponse {
  items: BookTag[];
  untaggedCount: number;
}
