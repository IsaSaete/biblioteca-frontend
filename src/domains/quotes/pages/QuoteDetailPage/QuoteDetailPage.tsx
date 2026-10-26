import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import ConfirmDialog from "../../../../components/ui/ConfirmDialog/ConfirmDialog";
import InlineError from "../../../../components/ui/InlineError/InlineError";
import Pill from "../../../../components/ui/Pill/Pill";
import { parseApiError } from "../../../auth/utils/parseApiError";
import QuoteFormDialog from "../../components/QuoteFormDialog/QuoteFormDialog";
import BookCover from "../../../books/components/BookCover/BookCover";
import { useGetBookQuery } from "../../../books/booksApi";
import { useDeleteQuoteMutation, useGetQuoteQuery } from "../../quotesApi";

const PencilIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </svg>
);

const CopyIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V6a2 2 0 0 1 2-2h9" />
  </svg>
);

const formatSavedDate = (isoDate: string): string => {
  const date = new Date(isoDate);

  return Number.isNaN(date.getTime())
    ? isoDate
    : date.toLocaleDateString("es", { dateStyle: "medium", timeZone: "UTC" });
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

// Detalle de cita (HU-29, HU-30): texto completo, página y acciones explícitas.
// Ir al libro solo ocurre si el usuario toca su tarjeta, nunca al abrir la cita.
const QuoteDetailPage = () => {
  const navigate = useNavigate();
  const { quoteId = "" } = useParams();
  const { data: quote, isLoading, error, refetch } = useGetQuoteQuery(quoteId);
  // La cita no trae portada (api-contract.md): se toma del libro, que suele
  // estar ya en caché por la ficha.
  const { data: book } = useGetBookQuery(quote?.book?.id ?? "", {
    skip: !quote?.book,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleteQuote, { isLoading: isDeleting, isError: hasDeleteFailed }] =
    useDeleteQuoteMutation();

  // Dónde queda el usuario al salir: la ficha del libro de la cita o, si es una
  // cita sin libro, la pestaña Citas.
  const homePath = quote?.book ? `/library/${quote.book.id}` : "/quotes";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(quote?.text ?? "");
      setCopyMessage("Cita copiada");
    } catch {
      setCopyMessage("No se pudo copiar la cita");
    }
  };

  const handleDelete = async () => {
    const result = await deleteQuote(quoteId);

    if (!result.error) {
      await navigate(homePath, { replace: true });
    }
  };

  // Volver al sitio de origen; si se entró directamente por el enlace, a la
  // ficha del libro de la cita.
  const goBack = () => {
    const hasHistory = (window.history.state as { idx?: number } | null)?.idx;

    if (hasHistory) {
      void navigate(-1);
    } else {
      void navigate(homePath);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <Box role="status" aria-label="Cargando la cita">
          <Skeleton variant="rounded" sx={{ height: 160 }} />
        </Box>
      );
    }

    if (parseApiError(error)?.code === "QUOTE_NOT_FOUND") {
      return (
        <Box role="alert" sx={{ textAlign: "center", py: 8 }}>
          <Typography color="text.secondary">
            Esta cita no existe o ya no está en tu biblioteca.
          </Typography>
        </Box>
      );
    }

    if (error || !quote) {
      return (
        <InlineError
          message="No hemos podido cargar esta cita."
          onRetry={() => void refetch()}
        />
      );
    }

    return (
      <Box sx={{ display: "grid", gap: 5 }}>
        <Box>
          <Box
            component="article"
            sx={{ bgcolor: "background.paper", borderRadius: 1.5, p: 4 }}
          >
            <Typography
              variant="quote"
              sx={{
                fontSize: "1.125rem",
                whiteSpace: "pre-line",
                overflowWrap: "anywhere",
              }}
            >
              {quote.text}
            </Typography>
            {quote.page && (
              <Typography
                color="text.secondary"
                sx={{ mt: 2, fontSize: "0.875rem" }}
              >
                Pág. {quote.page}
              </Typography>
            )}
            {quote.book ? (
              <Box
                sx={{
                  mt: 4,
                  pt: 4,
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  borderTop: 1,
                  borderColor: "divider",
                }}
              >
                <Box sx={{ width: 40, flexShrink: 0 }}>
                  <BookCover
                    title={quote.book.title}
                    coverUrl={book?.coverUrl}
                    size="small"
                  />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{ fontWeight: 700, overflowWrap: "anywhere" }}
                  >
                    {quote.book.title}
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ fontSize: "0.875rem", overflowWrap: "anywhere" }}
                  >
                    {quote.book.authors.join(", ")}
                  </Typography>
                </Box>
                <Pill
                  tone="accent"
                  label="Ir al libro"
                  endIcon="chevron-right"
                  onClick={() => void navigate(`/library/${quote.book?.id}`)}
                />
              </Box>
            ) : (
              quote.source && (
                <Box
                  sx={{
                    mt: 4,
                    pt: 4,
                    borderTop: 1,
                    borderColor: "divider",
                  }}
                >
                  <Typography
                    color="text.secondary"
                    sx={{ fontSize: "0.875rem" }}
                  >
                    Fuente
                  </Typography>
                  <Typography sx={{ overflowWrap: "anywhere" }}>
                    {quote.source}
                  </Typography>
                </Box>
              )
            )}
          </Box>
          <Typography
            color="text.secondary"
            sx={{ mt: 2, fontSize: "0.875rem", textAlign: "center" }}
          >
            Guardada el {formatSavedDate(quote.createdAt)}
          </Typography>
        </Box>
        <Box sx={{ display: "grid", gap: 2, mt: 4 }}>
          {hasDeleteFailed && (
            <Alert severity="error">
              No se pudo eliminar la cita. Inténtalo de nuevo.
            </Alert>
          )}
          <Pill
            tone="danger"
            label="Eliminar cita"
            fullWidth
            onClick={() => setIsConfirmingDelete(true)}
          />
        </Box>
        {isEditing && (
          <QuoteFormDialog
            ejemplarId={quote.ejemplarId}
            bookTitle={quote.book?.title}
            quote={quote}
            onClose={() => setIsEditing(false)}
          />
        )}
        <ConfirmDialog
          open={isConfirmingDelete}
          title="¿Eliminar esta cita?"
          description="Esta acción no se puede deshacer."
          confirmLabel="Sí, eliminar"
          pendingLabel="Eliminando…"
          isPending={isDeleting}
          onConfirm={() => void handleDelete()}
          onCancel={() => setIsConfirmingDelete(false)}
        />
      </Box>
    );
  };

  return (
    <Box
      component="main"
      sx={{ maxWidth: 480, mx: "auto", px: 4, pb: 8, display: "grid", gap: 4 }}
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
        {quote && (
          <Box>
            <IconButton
              aria-label="Copiar cita"
              onClick={() => void handleCopy()}
              sx={{ width: 44, height: 44 }}
            >
              <CopyIcon />
            </IconButton>
            <IconButton
              aria-label="Editar cita"
              onClick={() => setIsEditing(true)}
              sx={{ width: 44, height: 44 }}
            >
              <PencilIcon />
            </IconButton>
          </Box>
        )}
      </Box>
      {renderContent()}
      <Snackbar
        open={copyMessage !== null}
        autoHideDuration={3000}
        onClose={() => setCopyMessage(null)}
        message={copyMessage}
      />
    </Box>
  );
};

export default QuoteDetailPage;
