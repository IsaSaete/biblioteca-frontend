import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { LibraryBook } from "../../dto/LibraryBook";
import BookCover from "../BookCover/BookCover";

interface BookCardProps {
  book: LibraryBook;
}

// Tarjeta del grid: portada, título en negrita y autores en una línea
// truncada. Sin enlace hasta que exista la ficha de libro.
const BookCard = ({ book }: BookCardProps) => (
  <Box component="li" sx={{ listStyle: "none", minWidth: 0 }}>
    <BookCover title={book.title} coverUrl={book.coverUrl} />
    <Typography noWrap sx={{ mt: 2, fontWeight: 700 }} title={book.title}>
      {book.title}
    </Typography>
    <Typography noWrap color="text.secondary" variant="caption" component="p">
      {book.authors.join(", ")}
    </Typography>
  </Box>
);

export default BookCard;
