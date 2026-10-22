import { useState } from "react";
import { Link as RouterLink } from "react-router";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import InlineError from "../../../../components/ui/InlineError/InlineError";
import { useGetQuotesQuery } from "../../quotesApi";
import QuoteFormDialog from "../QuoteFormDialog/QuoteFormDialog";
import NoQuotesCard from "../NoQuotesCard/NoQuotesCard";
import QuoteCard from "../QuoteCard/QuoteCard";

interface BookQuotesSectionProps {
  bookId: string;
  ejemplarId: string;
  bookTitle: string;
}

const ChevronIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 5l7 7-7 7" />
  </svg>
);

// «Citas (n)» de la ficha: solo un adelanto con la última cita guardada y, si
// hay más, una fila para verlas todas; el listado completo vive en «Citas del
// libro». La API devuelve la más reciente primero, y `total` cuenta todas las
// del libro, no solo las traídas.
const BookQuotesSection = ({
  bookId,
  ejemplarId,
  bookTitle,
}: BookQuotesSectionProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const { data, isLoading, isError, refetch } = useGetQuotesQuery({ bookId });
  const latest = data?.items[0];

  const renderContent = () => {
    if (isLoading) {
      return null;
    }

    if (isError) {
      return (
        <InlineError
          message="No hemos podido cargar las citas."
          onRetry={() => void refetch()}
        />
      );
    }

    if (!latest || !data) {
      return <NoQuotesCard />;
    }

    return (
      <Box sx={{ bgcolor: "background.paper", borderRadius: 1.5 }}>
        <QuoteCard quote={latest} showBook={false} embedded />
        {data.total > 1 && (
          <Link
            component={RouterLink}
            to={`/library/${bookId}/quotes`}
            underline="none"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              minHeight: 44,
              px: 4,
              borderTop: 1,
              borderColor: "divider",
              fontSize: "0.875rem",
              color: "secondary.contrastText",
            }}
          >
            Ver las {data.total} citas
            <ChevronIcon />
          </Link>
        )}
      </Box>
    );
  };

  return (
    <Box
      component="section"
      aria-labelledby="quotes-title"
      sx={{ width: "100%" }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Typography
          id="quotes-title"
          component="h2"
          color="text.secondary"
          sx={{ fontSize: "0.875rem" }}
        >
          {data ? `Citas (${data.total})` : "Citas"}
        </Typography>
        <Link
          component="button"
          type="button"
          underline="none"
          onClick={() => setIsAdding(true)}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            minHeight: 44,
            // Un <button> no hereda la tipografía: sin esto salía con otra
            // fuente que «Ver las n citas».
            font: "inherit",
            fontSize: "0.875rem",
            color: "secondary.contrastText",
          }}
        >
          Añadir cita
        </Link>
      </Box>
      {renderContent()}
      {isAdding && (
        <QuoteFormDialog
          ejemplarId={ejemplarId}
          bookTitle={bookTitle}
          onClose={() => setIsAdding(false)}
        />
      )}
    </Box>
  );
};

export default BookQuotesSection;
