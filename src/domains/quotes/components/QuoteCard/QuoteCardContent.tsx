import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { Quote } from "../../dto/Quote";

interface QuoteCardContentProps {
  quote: Quote;
  showBook?: boolean;
}

// Texto en Lora cursiva, truncado a 3 líneas, con un pie separado por una
// línea: el libro (icono + título en Inter) y la página.
const QuoteCardContent = ({
  quote,
  showBook = true,
}: QuoteCardContentProps) => {
  const origin = showBook ? (quote.book?.title ?? quote.source) : undefined;
  const hasReference = Boolean(origin) || Boolean(quote.page);

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
    </>
  );
};

export default QuoteCardContent;
