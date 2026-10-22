import { useState } from "react";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import BottomSheet from "../../../../components/ui/BottomSheet/BottomSheet";
import FloatingLabelInput from "../../../../components/ui/FloatingLabelInput/FloatingLabelInput";
import Pill from "../../../../components/ui/Pill/Pill";
import type { QuoteBook } from "../../dto/QuoteBook";

interface QuoteBookFilterProps {
  books: QuoteBook[];
  selectedBookId?: string;
  onSelect: (bookId?: string) => void;
}

const ALL_BOOKS = "Todos los libros";

const normalize = (text: string): string =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("es");

interface OptionProps {
  label: string;
  count?: number;
  selected: boolean;
  onClick: () => void;
}

const Option = ({ label, count, selected, onClick }: OptionProps) => (
  <ButtonBase
    onClick={onClick}
    aria-pressed={selected}
    sx={{
      width: "100%",
      minHeight: 44,
      px: 2,
      justifyContent: "space-between",
      textAlign: "left",
      borderRadius: 1.5,
      gap: 3,
    }}
  >
    <Typography
      sx={{
        fontSize: "1rem",
        fontWeight: selected ? 500 : 400,
        overflowWrap: "anywhere",
      }}
    >
      {selected ? "✓ " : ""}
      {label}
    </Typography>
    {count !== undefined && (
      <Typography color="text.secondary" sx={{ fontSize: "0.875rem" }}>
        {count}
      </Typography>
    )}
  </ButtonBase>
);

// Filtro por libro de la pantalla Citas: una píldora con el filtro actual que
// abre una hoja con los libros que tienen citas (con su número) y un buscador
// propio, más «Todos los libros» para quitarlo.
const QuoteBookFilter = ({
  books,
  selectedBookId,
  onSelect,
}: QuoteBookFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = books.find((book) => book.bookId === selectedBookId);
  const visibleBooks = books.filter((book) =>
    normalize(book.title).includes(normalize(query.trim())),
  );

  const close = () => {
    setIsOpen(false);
    setQuery("");
  };

  const choose = (bookId?: string) => {
    onSelect(bookId);
    close();
  };

  return (
    <>
      <Pill
        tone="neutral"
        selected={false}
        label={`${selected?.title ?? ALL_BOOKS} ⌄`}
        onClick={() => setIsOpen(true)}
      />
      <BottomSheet open={isOpen} title="Filtrar por libro" onClose={close}>
        <Box sx={{ display: "grid", gap: 3, mt: 3 }}>
          <FloatingLabelInput
            label="Buscar un libro"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Box sx={{ maxHeight: "50vh", overflowY: "auto", display: "grid" }}>
            {query.trim() === "" && (
              <Option
                label={ALL_BOOKS}
                selected={selectedBookId === undefined}
                onClick={() => choose(undefined)}
              />
            )}
            {visibleBooks.map((book) => (
              <Option
                key={book.bookId}
                label={book.title}
                count={book.count}
                selected={book.bookId === selectedBookId}
                onClick={() => choose(book.bookId)}
              />
            ))}
            {visibleBooks.length === 0 && (
              <Typography color="text.secondary" sx={{ py: 3 }}>
                Ningún libro con ese nombre tiene citas.
              </Typography>
            )}
          </Box>
        </Box>
      </BottomSheet>
    </>
  );
};

export default QuoteBookFilter;
