import { useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router";
import BottomSheet from "../../../../components/ui/BottomSheet/BottomSheet";
import Button from "../../../../components/ui/Button/Button";
import { parseApiError } from "../../../auth/utils/parseApiError";
import { useLazyGetRandomBookQuery } from "../../../books/booksApi";
import BookCover from "../../../books/components/BookCover/BookCover";
import type { LibraryBook } from "../../../books/dto/LibraryBook";
import type { Quote } from "../../../quotes/dto/Quote";
import { useLazyGetQuotesQuery } from "../../../quotes/quotesApi";
import { useShake } from "../../hooks/useShake";
import { readShakeSetting } from "../../utils/shakeSetting";

type Suggestion =
  | { status: "loading" }
  | { status: "found"; book: LibraryBook; quote?: Quote }
  | { status: "empty" }
  | { status: "error" };

const pickRandom = <T,>(items: T[]): T | undefined =>
  items[Math.floor(Math.random() * items.length)];

// Huevo de Pascua (D-071): con el secreto activado, agitar el móvil en Inicio
// sugiere un libro de la biblioteca y una de sus citas. No tiene botón: se
// activa pulsando varias veces «Biblioteca». No dibuja nada hasta que sale.
const ShakeSuggestion = () => {
  const navigate = useNavigate();
  const [isEnabled] = useState(readShakeSetting);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [fetchBook] = useLazyGetRandomBookQuery();
  const [fetchQuotes] = useLazyGetQuotesQuery();
  // El último que salió, para que «Otro» y la siguiente sacudida no lo repitan.
  const lastBookId = useRef<string | undefined>(undefined);

  const suggest = async () => {
    setSuggestion({ status: "loading" });

    let result = await fetchBook(
      lastBookId.current ? { exclude: lastBookId.current } : undefined,
    );

    // Con un solo libro no hay otro que excluir: se vuelve a pedir sin excluir.
    if (result.error && lastBookId.current) {
      result = await fetchBook();
    }

    if (!result.data) {
      setSuggestion({
        status:
          parseApiError(result.error)?.code === "BOOK_NOT_FOUND"
            ? "empty"
            : "error",
      });
      return;
    }

    lastBookId.current = result.data.id;
    const quotes = await fetchQuotes({ bookId: result.data.id });

    setSuggestion({
      status: "found",
      book: result.data,
      quote: pickRandom(quotes.data?.items ?? []),
    });
  };

  // Con la hoja abierta, otra sacudida no hace nada.
  useShake(() => {
    if (suggestion === null) {
      void suggest();
    }
  }, isEnabled);

  const close = () => setSuggestion(null);

  return (
    <BottomSheet
      open={suggestion !== null}
      title="Un libro de tu estantería"
      onClose={close}
      showCloseButton
    >
      {suggestion?.status === "loading" && (
        <Typography role="status" color="text.secondary" sx={{ py: 4 }}>
          Buscando en tu estantería…
        </Typography>
      )}
      {suggestion?.status === "empty" && (
        <Typography sx={{ py: 4 }}>
          Todavía no tengo ningún libro que sugerirte. Añade alguno a tu
          biblioteca; los que tienes prestados no cuentan.
        </Typography>
      )}
      {suggestion?.status === "error" && (
        <Typography sx={{ py: 4 }}>
          No he podido buscar un libro ahora. Inténtalo de nuevo.
        </Typography>
      )}
      {suggestion?.status === "found" && (
        <Box sx={{ display: "grid", gap: 4, pt: 3, pb: 2 }}>
          <Box sx={{ display: "flex", gap: 4, alignItems: "flex-start" }}>
            <Box sx={{ width: 96, flexShrink: 0 }}>
              <BookCover
                title={suggestion.book.title}
                coverUrl={suggestion.book.coverUrl}
                decorative
              />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                component="h3"
                variant="h6"
                sx={{ overflowWrap: "anywhere" }}
              >
                {suggestion.book.title}
              </Typography>
              <Typography color="text.secondary">
                {suggestion.book.authors.join(", ")}
              </Typography>
            </Box>
          </Box>
          {suggestion.quote && (
            <Box
              component="blockquote"
              sx={{
                m: 0,
                pl: 3,
                borderLeft: 3,
                borderColor: "primary.main",
              }}
            >
              <Typography sx={{ fontStyle: "italic", whiteSpace: "pre-line" }}>
                {suggestion.quote.text}
              </Typography>
              {suggestion.quote.page !== undefined && (
                <Typography
                  color="text.secondary"
                  sx={{ fontSize: "0.875rem" }}
                >
                  Pág. {suggestion.quote.page}
                </Typography>
              )}
            </Box>
          )}
          <Box sx={{ display: "grid", gap: 2 }}>
            <Button
              fullWidth
              onClick={() => {
                const { id } = suggestion.book;
                close();
                void navigate(`/library/${id}`);
              }}
            >
              Ver ficha
            </Button>
            <Button variant="neutral" fullWidth onClick={() => void suggest()}>
              Otro
            </Button>
          </Box>
        </Box>
      )}
    </BottomSheet>
  );
};

export default ShakeSuggestion;
