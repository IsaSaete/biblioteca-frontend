import { useNavigate, useParams } from "react-router";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import InlineError from "../../../../components/ui/InlineError/InlineError";
import { parseApiError } from "../../../auth/utils/parseApiError";
import { useGetBookQuery } from "../../booksApi";
import BookCover from "../../components/BookCover/BookCover";
import type { BookStatus } from "../../dto/BookStatus";

const statusLabels: Record<BookStatus, string> = {
  pending: "Pendiente",
  reading: "Leyendo",
  read: "Leído",
  abandoned: "Abandonado",
};

const languageNames = new Intl.DisplayNames(["es"], { type: "language" });

const getLanguageName = (code: string): string => {
  try {
    return languageNames.of(code) ?? code;
  } catch {
    return code;
  }
};

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

// Ficha de libro (HU-20): por ahora los datos del libro, su estado y la
// sinopsis. Los datos del ejemplar, las etiquetas, el favorito, las citas y
// eliminar se añaden con sus historias; no se muestra nada que no funcione.
const BookDetailPage = () => {
  const navigate = useNavigate();
  const { bookId = "" } = useParams();
  const { data: book, isLoading, error, refetch } = useGetBookQuery(bookId);

  // Volver al sitio de origen (Biblioteca o Citas); si se entró directamente
  // por el enlace, a la Biblioteca.
  const goBack = () => {
    const hasHistory = (window.history.state as { idx?: number } | null)?.idx;

    if (hasHistory) {
      void navigate(-1);
    } else {
      void navigate("/library");
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <Box role="status" aria-label="Cargando el libro">
          <Skeleton
            variant="rounded"
            sx={{ width: 160, height: 240, mx: "auto" }}
          />
        </Box>
      );
    }

    if (parseApiError(error)?.code === "BOOK_NOT_FOUND") {
      return (
        <Box role="alert" sx={{ textAlign: "center", py: 8 }}>
          <Typography color="text.secondary">
            Este libro no está en tu biblioteca.
          </Typography>
        </Box>
      );
    }

    if (error || !book) {
      return (
        <InlineError
          message="No hemos podido cargar este libro."
          onRetry={() => void refetch()}
        />
      );
    }

    const details = [
      book.publisher,
      book.publishedYear?.toString(),
      book.pageCount ? `${book.pageCount} páginas` : undefined,
      book.language ? getLanguageName(book.language) : undefined,
    ].filter((detail): detail is string => Boolean(detail));

    return (
      <Box sx={{ display: "grid", gap: 5, justifyItems: "center" }}>
        <Box sx={{ width: 160 }}>
          <BookCover title={book.title} coverUrl={book.coverUrl} />
        </Box>
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h6" component="h1">
            {book.title}
          </Typography>
          <Typography color="text.secondary">
            {book.authors.join(", ")}
          </Typography>
        </Box>
        <Typography
          sx={{
            px: 3,
            py: 1,
            borderRadius: "999px",
            bgcolor: "secondary.main",
            color: "secondary.contrastText",
          }}
        >
          {statusLabels[book.status]}
        </Typography>
        <Typography
          color="text.secondary"
          variant="caption"
          sx={{ textAlign: "center" }}
        >
          {details.join(" · ")}
        </Typography>
        {book.synopsis && (
          <Box component="section" aria-labelledby="synopsis-title">
            <Typography
              id="synopsis-title"
              component="h2"
              variant="caption"
              color="text.secondary"
            >
              Sinopsis
            </Typography>
            <Typography sx={{ mt: 1, whiteSpace: "pre-line" }}>
              {book.synopsis}
            </Typography>
          </Box>
        )}
      </Box>
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
      {renderContent()}
    </Box>
  );
};

export default BookDetailPage;
