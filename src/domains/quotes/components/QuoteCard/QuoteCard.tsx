import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { Quote } from "../../dto/Quote";

interface QuoteCardProps {
  quote: Quote;
  // En la ficha la cita ya está dentro de su libro: no se repite la referencia.
  showBook?: boolean;
}

// Tarjeta de cita: texto en Lora cursiva, truncado a 3 líneas (el completo está
// en el detalle), con la página y, si procede, el libro debajo.
const QuoteCard = ({ quote, showBook = true }: QuoteCardProps) => {
  const reference = [
    showBook ? quote.book.title : undefined,
    quote.page ? `Pág. ${quote.page}` : undefined,
  ].filter((part): part is string => Boolean(part));

  return (
    <Box
      component="article"
      sx={{ bgcolor: "background.paper", borderRadius: 1.5, p: 4 }}
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
    </Box>
  );
};

export default QuoteCard;
