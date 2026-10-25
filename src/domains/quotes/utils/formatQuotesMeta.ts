import { formatCount } from "../../../utils/formatCount";

interface QuotesMetaInput {
  // Citas que cumplen el filtro actual; `undefined` mientras se cargan.
  total: number | undefined;
  // De cuántos libros salen. Sin él (con un libro elegido) no se muestra.
  bookCount?: number;
}

// Recuento bajo el título de Citas: «34 citas · 12 libros», o solo «3 citas»
// al filtrar por un libro.
export const formatQuotesMeta = ({
  total,
  bookCount,
}: QuotesMetaInput): string | undefined => {
  if (total === undefined) {
    return undefined;
  }

  const quotes = formatCount(total, "cita", "citas");

  return bookCount
    ? `${quotes} · ${formatCount(bookCount, "libro", "libros")}`
    : quotes;
};
