import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Button from "../../../../components/ui/Button/Button";
import { parseApiError } from "../../../auth/utils/parseApiError";
import { useGetBookQuery } from "../../../books/booksApi";
import NoQuotesCard from "../../components/NoQuotesCard/NoQuotesCard";
import QuotesList from "../../components/QuotesList/QuotesList";
import QuoteFormDialog from "../../components/QuoteFormDialog/QuoteFormDialog";
import { useGetQuotesQuery } from "../../quotesApi";

const BackIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

// Citas del libro: todas las citas de un libro, de la más reciente a la más
// antigua, con scroll infinito. Se llega desde «Ver todas» en la ficha.
const BookQuotesPage = () => {
  const navigate = useNavigate();
  const { bookId = "" } = useParams();
  const { data: book, error: bookError } = useGetBookQuery(bookId);
  const { data } = useGetQuotesQuery({ bookId });
  const [isAdding, setIsAdding] = useState(false);

  // Volver a la ficha; si se entró directamente por el enlace, también a ella.
  const goBack = () => {
    const hasHistory = (window.history.state as { idx?: number } | null)?.idx;

    if (hasHistory) {
      void navigate(-1);
    } else {
      void navigate(`/library/${bookId}`);
    }
  };

  const renderContent = () => {
    if (parseApiError(bookError)?.code === "BOOK_NOT_FOUND") {
      return (
        <Box role="alert" sx={{ textAlign: "center", py: 8 }}>
          <Typography color="text.secondary">
            Este libro no está en tu biblioteca.
          </Typography>
        </Box>
      );
    }

    return (
      <QuotesList bookId={bookId} showBook={false} empty={<NoQuotesCard />} />
    );
  };

  return (
    <Box
      component="main"
      sx={{ maxWidth: 480, mx: "auto", px: 4, pb: 8, display: "grid", gap: 4 }}
    >
      <Box sx={{ pt: "calc(env(safe-area-inset-top) + 8px)" }}>
        <IconButton
          aria-label="Volver"
          onClick={goBack}
          sx={{ width: 44, height: 44 }}
        >
          <BackIcon />
        </IconButton>
      </Box>
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h6" component="h1">
          {data ? `Citas (${data.total})` : "Citas"}
        </Typography>
        {book && (
          <Typography color="text.secondary" sx={{ fontSize: "1rem" }}>
            {book.title}
          </Typography>
        )}
      </Box>
      {renderContent()}
      {book && (
        <Button fullWidth onClick={() => setIsAdding(true)}>
          Añadir cita
        </Button>
      )}
      {book && isAdding && (
        <QuoteFormDialog
          ejemplarId={book.ejemplarId}
          bookTitle={book.title}
          onClose={() => setIsAdding(false)}
        />
      )}
    </Box>
  );
};

export default BookQuotesPage;
