import { useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import BottomSheet from "../../../../components/ui/BottomSheet/BottomSheet";
import Button from "../../../../components/ui/Button/Button";
import InlineError from "../../../../components/ui/InlineError/InlineError";
import Pill from "../../../../components/ui/Pill/Pill";
import { parseApiError } from "../../../auth/utils/parseApiError";
import QuoteFormDialog from "../../components/QuoteFormDialog/QuoteFormDialog";
import { useDeleteQuoteMutation, useGetQuoteQuery } from "../../quotesApi";

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
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleteQuote, { isLoading: isDeleting, isError: hasDeleteFailed }] =
    useDeleteQuoteMutation();

  const handleDelete = async () => {
    const result = await deleteQuote(quoteId);

    if (!result.error) {
      await navigate(quote ? `/library/${quote.book.id}` : "/library", {
        replace: true,
      });
    }
  };

  // Volver al sitio de origen; si se entró directamente por el enlace, a la
  // ficha del libro de la cita.
  const goBack = () => {
    const hasHistory = (window.history.state as { idx?: number } | null)?.idx;

    if (hasHistory) {
      void navigate(-1);
    } else {
      void navigate(quote ? `/library/${quote.book.id}` : "/library");
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
        <Box
          component="article"
          sx={{ bgcolor: "background.paper", borderRadius: 1.5, p: 4 }}
        >
          <Typography
            variant="quote"
            sx={{ whiteSpace: "pre-line", overflowWrap: "anywhere" }}
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
        </Box>
        <Link
          component={RouterLink}
          to={`/library/${quote.book.id}`}
          underline="none"
          color="inherit"
          aria-label={`Ir al libro ${quote.book.title}`}
          sx={{
            display: "block",
            bgcolor: "background.paper",
            borderRadius: 1.5,
            p: 4,
          }}
        >
          <Typography color="text.secondary" sx={{ fontSize: "0.875rem" }}>
            Ir al libro
          </Typography>
          <Typography sx={{ fontWeight: 700 }}>{quote.book.title}</Typography>
          <Typography color="text.secondary" sx={{ fontSize: "1rem" }}>
            {quote.book.authors.join(", ")}
          </Typography>
        </Link>
        <Box sx={{ display: "grid", gap: 2 }}>
          <Pill
            tone="accent"
            label="Editar cita"
            fullWidth
            onClick={() => setIsEditing(true)}
          />
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
            bookTitle={quote.book.title}
            quote={quote}
            onClose={() => setIsEditing(false)}
          />
        )}
        <BottomSheet
          open={isConfirmingDelete}
          title="¿Eliminar esta cita?"
          onClose={() => setIsConfirmingDelete(false)}
        >
          <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>
            Esta acción no se puede deshacer.
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

export default QuoteDetailPage;
