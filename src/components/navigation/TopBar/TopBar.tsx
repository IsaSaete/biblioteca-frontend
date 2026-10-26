import { useState } from "react";
import { useNavigate } from "react-router";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useGetBooksQuery } from "../../../domains/books/booksApi";
import BookCover from "../../../domains/books/components/BookCover/BookCover";
import type { LibraryBook } from "../../../domains/books/dto/LibraryBook";
import { useDebouncedValue } from "../../../domains/books/hooks/useDebouncedValue";
import { useHasCamera } from "../../../domains/books/hooks/useHasCamera";
import { normalizeText } from "../../../utils/normalizeText";
import { useOpenAddBookModal } from "../useOpenAddBookModal";

const SEARCH_DEBOUNCE_MS = 250;
const MIN_QUERY_LENGTH = 2;
const MAX_SUGGESTIONS = 5;
const SEARCH_LABEL = "Buscar en tu biblioteca";
// Buscador y botón de escaneo miden lo mismo.
const BAR_HEIGHT = 48;

const SearchIcon = () => (
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
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
);

const ScanIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" />
    <path d="M8 9v6M11 9v6M13.5 9v6M16 9v6" />
  </svg>
);

const matches = (book: LibraryBook, query: string): boolean =>
  normalizeText(`${book.title} ${book.authors.join(" ")}`).includes(
    normalizeText(query),
  );

// Barra superior de contenido: buscador de tu propia biblioteca (nunca un
// catálogo externo) con sugerencias mientras escribes, y escaneo de código de
// barras que abre la cámara directamente. Al elegir una sugerencia se abre la
// ficha del libro.
const TopBar = () => {
  const navigate = useNavigate();
  const hasCamera = useHasCamera();
  const openScan = useOpenAddBookModal("scan");
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const search = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS);
  const hasQuery = search.length >= MIN_QUERY_LENGTH;
  const { data, isFetching } = useGetBooksQuery(
    hasQuery ? { search } : undefined,
    {
      skip: !hasQuery,
    },
  );
  // Por si el servidor no filtra o aún no ha respondido a la última tecla, lo
  // que se sugiere siempre coincide con lo escrito.
  const suggestions = hasQuery
    ? (data?.items ?? [])
        .filter((book) => matches(book, query.trim()))
        .slice(0, MAX_SUGGESTIONS)
    : [];

  return (
    <Box
      sx={{
        maxWidth: 960,
        mx: "auto",
        px: 4,
        pt: "calc(env(safe-area-inset-top) + 16px)",
        display: "flex",
        alignItems: "flex-start",
        gap: 2,
      }}
    >
      <Autocomplete
        fullWidth
        options={suggestions}
        value={null}
        inputValue={query}
        open={isOpen && query.trim().length >= MIN_QUERY_LENGTH}
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        onInputChange={(_event, value, reason) =>
          setQuery(reason === "reset" ? "" : value)
        }
        onChange={(_event, book) => {
          if (book) {
            void navigate(`/library/${book.id}`);
          }
        }}
        filterOptions={(options) => options}
        getOptionLabel={(book) => book.title}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        loading={isFetching}
        loadingText="Buscando…"
        noOptionsText="Ningún libro de tu biblioteca coincide."
        forcePopupIcon={false}
        renderOption={({ key, ...props }, book) => (
          <Box
            component="li"
            key={key}
            {...props}
            sx={{ display: "flex", gap: 3, minHeight: 56 }}
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
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={SEARCH_LABEL}
            slotProps={{
              ...params.slotProps,
              htmlInput: {
                ...params.slotProps.htmlInput,
                "aria-label": SEARCH_LABEL,
              },
              input: {
                ...params.slotProps.input,
                sx: {
                  borderRadius: "999px",
                  height: BAR_HEIGHT,
                  "& .MuiInputBase-input": { py: 0, height: "100%" },
                },
                startAdornment: (
                  <InputAdornment
                    position="start"
                    sx={{ color: "text.secondary" }}
                  >
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
          />
        )}
      />
      {hasCamera && (
        <IconButton
          aria-label="Escanear el código de barras de un libro"
          onClick={openScan}
          sx={{
            width: BAR_HEIGHT,
            height: BAR_HEIGHT,
            flexShrink: 0,
            bgcolor: "secondary.main",
            color: "secondary.contrastText",
            "&:hover": { bgcolor: "secondary.main", opacity: 0.85 },
          }}
        >
          <ScanIcon />
        </IconButton>
      )}
    </Box>
  );
};

export default TopBar;
