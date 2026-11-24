import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { Quote } from "../../dto/Quote";
import { formatQuoteDate } from "../../utils/formatQuoteDate";
import BookReference from "../BookReference/BookReference";
import { referenceLineSx } from "../BookReference/referenceLineSx";

interface QuoteCardContentProps {
  quote: Quote;
  showBook?: boolean;
}

// Icono del pie: el del libro, o unas comillas si la cita no tiene libro. Los
// dos tienen la misma altura y el mismo color.
const FooterIcon = ({ hasBook }: { hasBook: boolean }) => (
  <Box
    sx={{
      display: "flex",
      flex: "none",
      color: "primary.main",
      "& svg": { width: 20, height: 20 },
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
      {hasBook ? (
        <>
          <path d="M12 7v14" />
          <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
        </>
      ) : (
        <>
          <path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />
          <path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />
        </>
      )}
    </svg>
  </Box>
);

// Una cita sin libro, con la tipografía del libro: con fuente, la fuente arriba
// y debajo cuándo se guardó, en dos niveles; sin fuente, solo «Guardada el…»,
// en una línea centrada con el icono. Ocupa lo mismo que una cita con libro.
const SourceReference = ({ quote }: { quote: Quote }) => {
  const saved = `Guardada el ${formatQuoteDate(quote.createdAt)}`;

  if (!quote.source) {
    return (
      <Box
        sx={{
          minWidth: 0,
          // Dos líneas de alto, para medir lo mismo, con la fecha en medio.
          minHeight: "3em",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box sx={{ ...referenceLineSx, fontWeight: 500 }}>{saved}</Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minWidth: 0 }}>
      <Box sx={{ ...referenceLineSx, fontWeight: 500 }}>{quote.source}</Box>
      <Box component="em" sx={{ ...referenceLineSx, display: "block" }}>
        {saved}
      </Box>
    </Box>
  );
};

// Texto en Lora cursiva, truncado a 3 líneas, con un pie separado por una
// línea. Con el libro a la vista, el pie siempre mide dos líneas: el libro
// (icono + autor y, debajo, título en cursiva, cada uno en una sola línea) y la
// página, alineada con la línea del título. Sin él, solo la página, si la hay.
const QuoteCardContent = ({
  quote,
  showBook = true,
}: QuoteCardContentProps) => {
  const hasReference = showBook || Boolean(quote.page);

  return (
    <>
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
            pt: 1.5,
            borderTop: 1,
            borderColor: "secondary.main",
            fontSize: "0.875rem",
          }}
        >
          {showBook && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                minWidth: 0,
              }}
            >
              <FooterIcon hasBook={Boolean(quote.book)} />
              {quote.book ? (
                <BookReference
                  title={quote.book.title}
                  authors={quote.book.authors}
                />
              ) : (
                <SourceReference quote={quote} />
              )}
            </Box>
          )}
          {quote.page && (
            <Typography
              color="text.secondary"
              sx={{
                flex: "none",
                // Alineada con la línea del título, la de abajo, y no en medio.
                alignSelf: "flex-end",
                fontSize: "inherit",
                lineHeight: 1.5,
                ml: "auto",
              }}
            >
              Pág. {quote.page}
            </Typography>
          )}
        </Box>
      )}
    </>
  );
};

export default QuoteCardContent;
