import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import Button from "../../../../components/ui/Button/Button";
import ExpandableText from "../../../../components/ui/ExpandableText/ExpandableText";
import Pill from "../../../../components/ui/Pill/Pill";
import BottomSheet from "../../../../components/ui/BottomSheet/BottomSheet";
import InlineError from "../../../../components/ui/InlineError/InlineError";
import { parseApiError } from "../../../auth/utils/parseApiError";
import {
  useGetBookQuery,
  useDeleteBookMutation,
  useGetBooksQuery,
  useUpdateEjemplarMutation,
} from "../../booksApi";
import BookCover from "../../components/BookCover/BookCover";
import EditBookDialog from "../../components/EditBookDialog/EditBookDialog";
import EjemplarDataSection from "../../components/EjemplarDataSection/EjemplarDataSection";
import BookQuotesSection from "../../../quotes/components/BookQuotesSection/BookQuotesSection";
import StatusSelector from "../../components/StatusSelector/StatusSelector";
import { capitalizeWords } from "../../utils/capitalizeFirst";
import { getTagSuggestions } from "../../utils/getTagSuggestions";

// En escritorio la ficha pasa a dos columnas (pantallas-y-flujos.md, «Reglas de
// adaptación»): portada y datos a la izquierda, citas a la derecha. En móvil y
// tablet las tres zonas se apilan en este mismo orden.
const DESKTOP_QUOTES_PREVIEW = 3;

const contentGridSx = {
  display: "grid",
  gap: 5,
  gridTemplateAreas: '"info" "quotes" "danger"',
  gridTemplateColumns: "minmax(0, 1fr)",
  "@media (min-width: 1024px)": {
    gridTemplateAreas: '"info quotes" "danger quotes"',
    gridTemplateColumns: "minmax(0, 420px) minmax(0, 1fr)",
    gridTemplateRows: "auto 1fr",
    columnGap: 8,
    alignItems: "start",
  },
} as const;

const columnSx = {
  display: "grid",
  gap: 5,
  justifyItems: "center",
  minWidth: 0,
} as const;

const languageNames = new Intl.DisplayNames(["es"], { type: "language" });

const getLanguageName = (code: string): string => {
  try {
    return languageNames.of(code) ?? code;
  } catch {
    return code;
  }
};

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
  </svg>
);

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
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const { data: book, isLoading, error, refetch } = useGetBookQuery(bookId);
  const [updateEjemplar, { isError: hasUpdateFailed, isLoading: isUpdating }] =
    useUpdateEjemplarMutation();
  // Sugerencias a partir de los libros que ya hay cargados: el contrato no
  // tiene un endpoint de etiquetas.
  const { data: library } = useGetBooksQuery();
  const [isEditingBook, setIsEditingBook] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleteBook, { isLoading: isDeleting, isError: hasDeleteFailed }] =
    useDeleteBookMutation();

  const handleDelete = async () => {
    const result = await deleteBook(bookId);

    if (!result.error) {
      await navigate("/library", { replace: true });
    }
  };

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
      <Box sx={contentGridSx}>
        <Box sx={{ gridArea: "info", ...columnSx }}>
          <Box sx={{ width: 160 }}>
            <BookCover title={book.title} coverUrl={book.coverUrl} />
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" component="h1">
              {book.title}
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: "1rem" }}>
              {book.authors.join(", ")}
            </Typography>
          </Box>
          <StatusSelector
            status={book.status}
            disabled={isUpdating}
            onChange={(status) =>
              void updateEjemplar({ bookId: book.id, changes: { status } })
            }
          />
          <Typography
            color="text.secondary"
            sx={{ textAlign: "center", fontSize: "0.875rem" }}
          >
            {details.join(" · ")}
          </Typography>
          {book.tags && book.tags.length > 0 && (
            <Box
              component="ul"
              aria-label="Etiquetas"
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 2,
                m: 0,
                p: 0,
                listStyle: "none",
              }}
            >
              {book.tags.map((tag) => (
                <Typography
                  key={tag}
                  component="li"
                  sx={{
                    px: 3,
                    py: 1,
                    fontSize: "0.875rem",
                    borderRadius: "999px",
                    border: 1,
                    borderColor: "primary.main",
                    color: "secondary.contrastText",
                  }}
                >
                  {capitalizeWords(tag)}
                </Typography>
              ))}
            </Box>
          )}
          <Button variant="text" onClick={() => setIsEditingBook(true)}>
            Editar datos
          </Button>
          {isEditingBook && (
            <EditBookDialog
              book={book}
              tagSuggestions={getTagSuggestions(library?.items ?? [])}
              onClose={() => setIsEditingBook(false)}
            />
          )}
          {book.synopsis && (
            <Box
              component="section"
              aria-labelledby="synopsis-title"
              sx={{ width: "100%" }}
            >
              <Typography
                id="synopsis-title"
                component="h2"
                color="text.secondary"
                sx={{ fontSize: "0.875rem" }}
              >
                Sinopsis
              </Typography>
              <Box
                sx={{
                  mt: 1,
                  bgcolor: "background.paper",
                  borderRadius: 1.5,
                  p: 4,
                }}
              >
                <ExpandableText text={book.synopsis} />
              </Box>
            </Box>
          )}
          <EjemplarDataSection book={book} />
        </Box>
        <Box sx={{ gridArea: "quotes", minWidth: 0 }}>
          <BookQuotesSection
            bookId={book.id}
            ejemplarId={book.ejemplarId}
            bookTitle={book.title}
            previewCount={isDesktop ? DESKTOP_QUOTES_PREVIEW : 1}
          />
        </Box>
        <Box sx={{ gridArea: "danger", ...columnSx }}>
          {hasDeleteFailed && (
            <Alert severity="error" sx={{ width: "100%" }}>
              No se pudo eliminar el libro. Inténtalo de nuevo.
            </Alert>
          )}
          <Pill
            tone="danger"
            label="Eliminar libro de mi biblioteca"
            fullWidth
            onClick={() => setIsConfirmingDelete(true)}
          />
          <BottomSheet
            open={isConfirmingDelete}
            title="¿Eliminar este libro?"
            onClose={() => setIsConfirmingDelete(false)}
          >
            <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>
              Se quitará de tu biblioteca junto con sus citas. Esta acción no se
              puede deshacer.
            </Typography>
            <Box sx={{ display: "grid", gap: 2 }}>
              <Pill
                tone="danger"
                label={isDeleting ? "Eliminando…" : "Sí, eliminar"}
                fullWidth
                disabled={isDeleting}
                onClick={() => void handleDelete()}
              />
              <Button
                variant="text"
                fullWidth
                disabled={isDeleting}
                onClick={() => setIsConfirmingDelete(false)}
              >
                Cancelar
              </Button>
            </Box>
          </BottomSheet>
        </Box>
      </Box>
    );
  };

  return (
    <Box
      component="main"
      sx={{
        maxWidth: { xs: 480, md: 960 },
        mx: "auto",
        px: 4,
        pb: 8,
        display: "grid",
        gap: 4,
      }}
    >
      <Box
        sx={{
          pt: "calc(env(safe-area-inset-top) + 8px)",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <IconButton
          aria-label="Volver"
          onClick={goBack}
          sx={{ width: 44, height: 44 }}
        >
          <BackIcon />
        </IconButton>
        {book && (
          <IconButton
            aria-label={
              book.favorite ? "Quitar de favoritos" : "Añadir a favoritos"
            }
            aria-pressed={book.favorite}
            onClick={() =>
              void updateEjemplar({
                bookId: book.id,
                changes: { favorite: !book.favorite },
              })
            }
            sx={{
              width: 44,
              height: 44,
              color: book.favorite ? "primary.main" : "text.secondary",
            }}
          >
            <StarIcon filled={book.favorite} />
          </IconButton>
        )}
      </Box>
      {hasUpdateFailed && (
        <Alert severity="error">
          No se pudo guardar el cambio. Inténtalo de nuevo.
        </Alert>
      )}
      {renderContent()}
    </Box>
  );
};

export default BookDetailPage;
