// Forma de `quote` en api-contract.md (`quotes`): igual en el feed, el detalle
// y la ficha. `book.title` y `book.authors` ya llevan los overrides aplicados.
// Una cita sin libro (D-023) no lleva `ejemplarId` ni `book`, y puede llevar
// `source`: de dónde sale.
export interface Quote {
  id: string;
  ejemplarId?: string;
  text: string;
  page?: number;
  source?: string;
  createdAt: string;
  book?: {
    id: string;
    title: string;
    authors: string[];
  };
}
