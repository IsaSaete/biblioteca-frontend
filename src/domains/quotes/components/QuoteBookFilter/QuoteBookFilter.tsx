import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import BottomSheet from "../../../../components/ui/BottomSheet/BottomSheet";
import FloatingLabelInput from "../../../../components/ui/FloatingLabelInput/FloatingLabelInput";
import Pill from "../../../../components/ui/Pill/Pill";
import SheetOption from "../../../../components/ui/SheetOption/SheetOption";
import { normalizeText } from "../../../../utils/normalizeText";
import type { QuoteBook } from "../../dto/QuoteBook";

export interface QuoteFilterSelection {
  bookId?: string;
  unlinked?: boolean;
}

interface QuoteBookFilterProps {
  books: QuoteBook[];
  // Citas sin libro: la entrada «Sin libro» solo aparece si hay alguna.
  unlinkedCount: number;
  selection: QuoteFilterSelection;
  onSelect: (selection: QuoteFilterSelection) => void;
}

const ALL_BOOKS = "Todos los libros";
const NO_BOOK = "Sin libro";
// La hoja nunca necesita scroll: se listan los más citados y el resto se
// encuentra escribiendo en el buscador, que está siempre.
const MAX_OPTIONS = 5;

// Filtro por libro de la pantalla Citas: una píldora con el filtro actual que
// abre una hoja con los libros que tienen citas (con su número) y un buscador
// propio, más «Todos los libros» para quitarlo.
const QuoteBookFilter = ({
  books,
  unlinkedCount,
  selection,
  onSelect,
}: QuoteBookFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selectedBookId = selection.bookId;
  const selected = books.find((book) => book.bookId === selectedBookId);
  const isUnlinkedSelected = selection.unlinked === true;
  const matches = books
    .filter((book) =>
      normalizeText(book.title).includes(normalizeText(query.trim())),
    )
    .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title, "es"));
  const visibleBooks = matches.slice(0, MAX_OPTIONS);
  const hiddenCount = matches.length - visibleBooks.length;

  const close = () => {
    setIsOpen(false);
    setQuery("");
  };

  const choose = (next: QuoteFilterSelection) => {
    onSelect(next);
    close();
  };

  return (
    <>
      <Pill
        tone="neutral"
        outlined
        hasPopup
        endIcon="chevron-down"
        label={isUnlinkedSelected ? NO_BOOK : (selected?.title ?? ALL_BOOKS)}
        onClick={() => setIsOpen(true)}
      />
      <BottomSheet open={isOpen} title="Filtrar por libro" onClose={close}>
        <Box sx={{ display: "grid", gap: 3, mt: 3 }}>
          <FloatingLabelInput
            label="Buscar un libro"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Box sx={{ display: "grid" }}>
            {query.trim() === "" && (
              <SheetOption
                label={ALL_BOOKS}
                selected={selectedBookId === undefined && !isUnlinkedSelected}
                onClick={() => choose({})}
              />
            )}
            {query.trim() === "" && unlinkedCount > 0 && (
              <SheetOption
                label={NO_BOOK}
                count={unlinkedCount}
                selected={isUnlinkedSelected}
                onClick={() => choose({ unlinked: true })}
              />
            )}
            {visibleBooks.map((book) => (
              <SheetOption
                key={book.bookId}
                label={book.title}
                count={book.count}
                selected={book.bookId === selectedBookId}
                onClick={() => choose({ bookId: book.bookId })}
              />
            ))}
            {visibleBooks.length === 0 && (
              <Typography color="text.secondary" sx={{ py: 3 }}>
                Ningún libro con ese nombre tiene citas.
              </Typography>
            )}
            {hiddenCount > 0 && (
              <Typography
                color="text.secondary"
                sx={{ pt: 2, px: 2, fontSize: "0.875rem" }}
              >
                {query.trim() === ""
                  ? "Escribe para buscar entre el resto de tus libros."
                  : `Hay ${hiddenCount} más: escribe más para afinar.`}
              </Typography>
            )}
          </Box>
        </Box>
      </BottomSheet>
    </>
  );
};

export default QuoteBookFilter;
