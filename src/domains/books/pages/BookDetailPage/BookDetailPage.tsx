import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import Accordion from "../../../../components/ui/Accordion/Accordion";
import InlineError from "../../../../components/ui/InlineError/InlineError";
import { parseApiError } from "../../../auth/utils/parseApiError";
import { useGetBookQuery } from "../../booksApi";
import BookCover from "../../components/BookCover/BookCover";
import type { BookFormat } from "../../dto/BookFormat";
import type { BookProvenance } from "../../dto/BookProvenance";
import type { BookStatus } from "../../dto/BookStatus";
import type { LibraryBook } from "../../dto/LibraryBook";

const statusLabels: Record<BookStatus, string> = {
  pending: "Pendiente",
  reading: "Leyendo",
  read: "Leído",
  abandoned: "Abandonado",
};

const formatLabels: Record<BookFormat, string> = {
  hardcover: "Tapa dura",
  paperback: "Tapa blanda",
  pocket: "Bolsillo",
};

const provenanceLabels: Record<BookProvenance, string> = {
  bought: "Comprado",
  gift: "Regalo",
  borrowed: "Prestado",
  inherited: "Heredado",
};

const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);

  return Number.isNaN(date.getTime())
    ? isoDate
    : date.toLocaleDateString("es", { dateStyle: "long", timeZone: "UTC" });
};

// Solo las filas con dato: nunca una fila en blanco.
const getCopyRows = (book: LibraryBook): [string, string][] =>
  (
    [
      ["Ubicación", book.location],
      ["Formato", book.format && formatLabels[book.format]],
      ["Procedencia", book.provenance && provenanceLabels[book.provenance]],
      [
        "Fecha de adquisición",
        book.acquisitionDate && formatDate(book.acquisitionDate),
      ],
      ["Notas", book.notes],
    ] as [string, string | undefined][]
  ).filter((row): row is [string, string] => Boolean(row[1]));

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
  const [isCopyExpanded, setIsCopyExpanded] = useState(false);

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
    const copyRows = getCopyRows(book);

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
                variant="caption"
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: "999px",
                  border: 1,
                  borderColor: "divider",
                }}
              >
                {tag}
              </Typography>
            ))}
          </Box>
        )}
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
        <Box sx={{ width: "100%" }}>
          <Accordion
            title="Datos de tu ejemplar"
            expanded={isCopyExpanded}
            onChange={setIsCopyExpanded}
            isEditable={false}
          >
            {copyRows.length === 0 ? (
              <Typography color="text.secondary">
                Todavía no hay datos de tu ejemplar.
              </Typography>
            ) : (
              <Box component="dl" sx={{ m: 0, display: "grid", gap: 3 }}>
                {copyRows.map(([label, value]) => (
                  <Box key={label}>
                    <Typography
                      component="dt"
                      variant="caption"
                      color="text.secondary"
                    >
                      {label}
                    </Typography>
                    <Typography component="dd" sx={{ m: 0 }}>
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Accordion>
        </Box>
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
