import { Link as RouterLink } from "react-router";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import type { Quote } from "../../dto/Quote";

interface QuoteCardProps {
  quote: Quote;
  // En la ficha la cita ya está dentro de su libro: no se repite la referencia.
  // Una cita sin libro muestra su fuente, si la tiene, en su lugar.
  showBook?: boolean;
  // Sin fondo ni esquinas propias, para vivir dentro de otra tarjeta.
  embedded?: boolean;
}

// Tarjeta de cita: texto en Lora cursiva, truncado a 3 líneas, con un pie
// separado por una línea: el libro (icono + título en Inter) y la página. Toda la tarjeta lleva al detalle, donde está el
// texto completo.
const QuoteCard = ({
  quote,
  showBook = true,
  embedded = false,
}: QuoteCardProps) => {
  const origin = showBook ? (quote.book?.title ?? quote.source) : undefined;
  const hasReference = Boolean(origin) || Boolean(quote.page);

  return (
    <Link
      component={RouterLink}
      to={`/quotes/${quote.id}`}
      underline="none"
      color="inherit"
      aria-label={`Abrir la cita: ${quote.text}`}
      sx={{
        display: "flex",
        flexDirection: "column",
        // Llena la celda de la cuadrícula: así las tarjetas de una fila miden
        // lo mismo y su pie queda alineado abajo.
        height: "100%",
        p: 4,
        ...(!embedded && { bgcolor: "background.paper", borderRadius: 1.5 }),
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
          mb: hasReference ? 3 : 0,
        }}
      >
        {quote.text}
      </Typography>
      {hasReference && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 3,
            mt: "auto",
            pt: 3,
            borderTop: 1,
            borderColor: "secondary.main",
            fontSize: "0.875rem",
          }}
        >
          {origin && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                minWidth: 0,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flex: "none",
                  color: "primary.main",
                  "& svg": { width: 16, height: 16 },
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 7v14" />
                  <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
                </svg>
              </Box>
              <Typography
                title={origin}
                sx={{
                  fontSize: "inherit",
                  fontWeight: 500,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {origin}
              </Typography>
            </Box>
          )}
          {quote.page && (
            <Typography
              color="text.secondary"
              sx={{ flex: "none", fontSize: "inherit", ml: "auto" }}
            >
              Pág. {quote.page}
            </Typography>
          )}
        </Box>
      )}
    </Link>
  );
};

export default QuoteCard;
