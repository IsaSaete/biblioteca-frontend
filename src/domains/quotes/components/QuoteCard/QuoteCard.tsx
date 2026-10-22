import { Link as RouterLink } from "react-router";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import type { Quote } from "../../dto/Quote";

interface QuoteCardProps {
  quote: Quote;
  // En la ficha la cita ya está dentro de su libro: no se repite la referencia.
  // Una cita sin libro muestra su fuente, si la tiene, en su lugar.
  showBook?: boolean;
}

// Tarjeta de cita: texto en Lora cursiva, truncado a 3 líneas, con la página y,
// si procede, el libro debajo. Toda la tarjeta lleva al detalle, donde está el
// texto completo.
const QuoteCard = ({ quote, showBook = true }: QuoteCardProps) => {
  const reference = [
    showBook ? (quote.book?.title ?? quote.source) : undefined,
    quote.page ? `Pág. ${quote.page}` : undefined,
  ].filter((part): part is string => Boolean(part));

  return (
    <Link
      component={RouterLink}
      to={`/quotes/${quote.id}`}
      underline="none"
      color="inherit"
      aria-label={`Abrir la cita: ${quote.text}`}
      sx={{
        display: "block",
        bgcolor: "background.paper",
        borderRadius: 1.5,
        p: 4,
      }}
    >
      <Typography
        variant="quote"
        sx={{
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 3,
          overflow: "hidden",
          overflowWrap: "anywhere",
        }}
      >
        {quote.text}
      </Typography>
      {reference.length > 0 && (
        <Typography color="text.secondary" sx={{ mt: 2, fontSize: "0.875rem" }}>
          {reference.join(" · ")}
        </Typography>
      )}
    </Link>
  );
};

export default QuoteCard;
