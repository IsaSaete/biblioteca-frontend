import { useState } from "react";
import { Link as RouterLink } from "react-router";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Button from "../../../../components/ui/Button/Button";
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

// «Citas (n)» de la ficha: solo un adelanto con la última cita guardada; el
// listado completo vive en la pantalla de Citas. La API devuelve la más
// reciente primero, y `total` cuenta todas las del libro, no solo las traídas.
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

    return latest ? (
      <QuoteCard quote={latest} showBook={false} />
    ) : (
      <NoQuotesCard />
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
        {data && data.total > 1 && (
          <Link
            component={RouterLink}
            to={`/library/${bookId}/quotes`}
            underline="hover"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              minHeight: 44,
              fontSize: "0.875rem",
              color: "secondary.contrastText",
            }}
          >
            Ver todas ›
          </Link>
        )}
      </Box>
      <Box sx={{ display: "grid", gap: 4 }}>
        {renderContent()}
        <Button fullWidth onClick={() => setIsAdding(true)}>
          Añadir cita
        </Button>
      </Box>
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
