import { Link as RouterLink } from "react-router";
import Link from "@mui/material/Link";
import type { Quote } from "../../dto/Quote";
import QuoteCardContent from "./QuoteCardContent";
import { quoteCardSx } from "./quoteCardSx";

interface QuoteCardProps {
  quote: Quote;
  // En la ficha la cita ya está dentro de su libro: no se repite la referencia.
  // Una cita sin libro muestra su fuente, si la tiene, en su lugar.
  showBook?: boolean;
  // Sin fondo ni esquinas propias, para vivir dentro de otra tarjeta.
  embedded?: boolean;
}

// Tarjeta de cita: el contenido (ver QuoteCardContent) dentro de un enlace a
// su detalle, donde está el texto completo.
const QuoteCard = ({
  quote,
  showBook = true,
  embedded = false,
}: QuoteCardProps) => (
  <Link
    component={RouterLink}
    to={`/quotes/${quote.id}`}
    underline="none"
    color="inherit"
    sx={quoteCardSx(embedded)}
  >
    <QuoteCardContent quote={quote} showBook={showBook} />
  </Link>
);

export default QuoteCard;
