import { useState } from "react";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import FloatingLabelInput from "../../../../components/ui/FloatingLabelInput/FloatingLabelInput";
import FullScreenModal from "../../../../components/ui/FullScreenModal/FullScreenModal";
import InlineError from "../../../../components/ui/InlineError/InlineError";
import Pill from "../../../../components/ui/Pill/Pill";
import { useGetBooksQuery } from "../../../books/booksApi";
import BookCover from "../../../books/components/BookCover/BookCover";
import type { LibraryBook } from "../../../books/dto/LibraryBook";
import { useDebouncedValue } from "../../../books/hooks/useDebouncedValue";

// Se listan pocos libros para no necesitar scroll: el resto se busca.
const MAX_RESULTS = 5;
const SEARCH_DEBOUNCE_MS = 300;
const TITLE_ID = "select-book-title";

interface SelectBookDialogProps {
  // `null` = cita sin libro.
  onSelect: (book: LibraryBook | null) => void;
  onClose: () => void;
}

const normalize = (text: string): string =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("es");

const matches = (book: LibraryBook, query: string): boolean =>
  normalize(`${book.title} ${book.authors.join(" ")}`).includes(
    normalize(query),
  );

// Primer paso de «Añadir cita» desde la pestaña Citas: buscar entre los libros
// de tu propia biblioteca (nunca catálogos externos) o guardar una cita sin
// libro (D-023).
const SelectBookDialog = ({ onSelect, onClose }: SelectBookDialogProps) => {
  const [query, setQuery] = useState("");
  const search = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS);
  const { data, isLoading, isError, refetch } = useGetBooksQuery(
    search ? { search } : undefined,
  );
  // Por si el servidor no filtra (o aún no ha respondido a la última tecla),
  // lo que se ve siempre coincide con lo escrito.
  const results = (data?.items ?? [])
    .filter((book) => !query.trim() || matches(book, query.trim()))
    .slice(0, MAX_RESULTS);

  const renderResults = () => {
    if (isLoading) {
      return (
        <Typography role="status" color="text.secondary">
          Buscando…
        </Typography>
      );
    }

    if (isError) {
      return (
        <InlineError
          message="No hemos podido cargar tus libros."
          onRetry={() => void refetch()}
        />
      );
    }

    if (results.length === 0) {
      return (
        <Typography color="text.secondary">
          {query.trim()
            ? "No hay ningún libro de tu biblioteca con ese nombre."
            : "Todavía no tienes libros en tu biblioteca."}
        </Typography>
      );
    }

    return (
      <Box component="ul" aria-label="Tus libros" sx={{ m: 0, p: 0 }}>
        {results.map((book) => (
          <Box component="li" key={book.ejemplarId} sx={{ listStyle: "none" }}>
            <ButtonBase
              onClick={() => onSelect(book)}
              aria-label={`${book.title}, ${book.authors.join(", ")}`}
              sx={{
                width: "100%",
                minHeight: 56,
                gap: 3,
                p: 1,
                justifyContent: "flex-start",
                textAlign: "left",
                borderRadius: 1.5,
              }}
            >
              <Box sx={{ width: 32, flexShrink: 0 }}>
                <BookCover
                  title={book.title}
                  coverUrl={book.coverUrl}
                  size="small"
                />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700, overflowWrap: "anywhere" }}>
                  {book.title}
                </Typography>
                <Typography
                  color="text.secondary"
                  sx={{ fontSize: "0.875rem", overflowWrap: "anywhere" }}
                >
                  {book.authors.join(", ")}
                </Typography>
              </Box>
            </ButtonBase>
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <FullScreenModal titleId={TITLE_ID} onClose={onClose}>
      <Box sx={{ display: "grid", gap: 5, pt: 4 }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography id={TITLE_ID} variant="h6" component="h2">
            Elige un libro
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1, fontSize: "1rem" }}>
            ¿De qué libro de tu biblioteca es la cita?
          </Typography>
        </Box>
        <FloatingLabelInput
          label="Buscar un libro"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {renderResults()}
        <Box sx={{ display: "grid", gap: 2 }}>
          <Typography
            color="text.secondary"
            sx={{ fontSize: "0.875rem", textAlign: "center" }}
          >
            ¿Es de un libro prestado, de una biblioteca o de un paper?
          </Typography>
          <Pill
            label="Cita sin libro"
            tone="neutral"
            outlined
            fullWidth
            onClick={() => onSelect(null)}
          />
        </Box>
      </Box>
    </FullScreenModal>
  );
};

export default SelectBookDialog;
