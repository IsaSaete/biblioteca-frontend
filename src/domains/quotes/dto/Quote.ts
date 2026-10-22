// Forma de `quote` en api-contract.md (`quotes`): igual en el feed, el detalle
// y la ficha. `book.title` y `book.authors` ya llevan los overrides aplicados.
export interface Quote {
  id: string;
  ejemplarId: string;
  text: string;
  page?: number;
  createdAt: string;
  book: {
    id: string;
    title: string;
    authors: string[];
  };
}
