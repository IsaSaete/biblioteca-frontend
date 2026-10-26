import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import Typography from "@mui/material/Typography";
import Button from "../../../../components/ui/Button/Button";
import FloatingLabelInput from "../../../../components/ui/FloatingLabelInput/FloatingLabelInput";
import { useSearchExternalQuery } from "../../booksApi";
import type { ExternalBook } from "../../dto/ExternalBook";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { getBookLookupError } from "../../utils/getBookLookupError";
import BookCover from "../BookCover/BookCover";

const SEARCH_DEBOUNCE_MS = 400;
const MIN_QUERY_LENGTH = 3;

interface SearchStepProps {
  initialQuery?: string;
  onBookSelected: (book: ExternalBook, query: string) => void;
  onManualEntry: (query: string) => void;
}

// «Buscar por título o autor» (HU-16): catálogo externo, no tu biblioteca. La
// consulta espera a que el usuario deje de escribir y a tener 3 letras.
const SearchStep = ({
  initialQuery = "",
  onBookSelected,
  onManualEntry,
}: SearchStepProps) => {
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS);
  const canSearch = debouncedQuery.length >= MIN_QUERY_LENGTH;
  const { data, error, isFetching } = useSearchExternalQuery(debouncedQuery, {
    skip: !canSearch,
  });

  const lookupError = error ? getBookLookupError(error) : null;

  return (
    <Box sx={{ display: "grid", gap: 5 }}>
      <FloatingLabelInput
        label="Título o autor"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        autoComplete="off"
        helperText={`Escribe al menos ${MIN_QUERY_LENGTH} letras.`}
      />

      <Box role="status" aria-live="polite">
        {canSearch && isFetching && (
          <Typography color="text.secondary">Buscando…</Typography>
        )}
      </Box>

      {canSearch && !isFetching && lookupError && (
        <Alert
          severity="error"
          action={
            lookupError.offersManualEntry && (
              <Button
                variant="text"
                color="inherit"
                onClick={() => onManualEntry(query.trim())}
              >
                Añadir manualmente
              </Button>
            )
          }
        >
          {lookupError.message}
        </Alert>
      )}

      {canSearch && !isFetching && !lookupError && data?.length === 0 && (
        <Box sx={{ display: "grid", gap: 2, justifyItems: "center" }}>
          <Typography color="text.secondary">
            No hemos encontrado ningún libro con esa búsqueda.
          </Typography>
          <Button variant="text" onClick={() => onManualEntry(query.trim())}>
            Añadir manualmente
          </Button>
        </Box>
      )}

      {canSearch && !isFetching && !lookupError && data && data.length > 0 && (
        <List
          aria-label="Resultados"
          disablePadding
          sx={{ display: "grid", gap: 2 }}
        >
          {data.map((book, index) => (
            <ListItemButton
              key={`${book.isbn ?? book.title}-${index}`}
              onClick={() => onBookSelected(book, query)}
              sx={{
                gap: 4,
                minHeight: 44,
                borderRadius: 2,
                alignItems: "center",
              }}
            >
              <Box sx={{ width: 48, flexShrink: 0 }}>
                <BookCover
                  title={book.title}
                  coverUrl={book.coverUrl}
                  size="small"
                />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 500 }}>{book.title}</Typography>
                <Typography color="text.secondary">
                  {book.authors.join(", ")}
                </Typography>
              </Box>
            </ListItemButton>
          ))}
        </List>
      )}
    </Box>
  );
};

export default SearchStep;
