import { Link as RouterLink } from "react-router";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import type { LibraryBook } from "../../dto/LibraryBook";
import BookCover from "../BookCover/BookCover";

interface BookCardProps {
  book: LibraryBook;
}

// Título y autores en hasta dos líneas: cortar en una sola dejaba la mayoría de
// títulos a medias. Solo si no caben en dos se recorta con «…» (el texto
// completo queda en el atributo `title`).
const clampLines = (lines: number) => ({
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: lines,
  overflow: "hidden",
  overflowWrap: "anywhere",
});

// Tarjeta del grid: portada, título en negrita y autores debajo. Toda la
// tarjeta lleva a la ficha del libro.
const BookCard = ({ book }: BookCardProps) => {
  const authors = book.authors.join(", ");

  return (
    <Box component="li" sx={{ listStyle: "none", minWidth: 0 }}>
      <Link
        component={RouterLink}
        to={`/library/${book.id}`}
        underline="none"
        color="inherit"
        aria-label={`${book.title}, ${authors}`}
        sx={{ display: "block", borderRadius: 1.5 }}
      >
        <BookCover title={book.title} coverUrl={book.coverUrl} />
        <Typography
          sx={{ mt: 2, fontWeight: 700, ...clampLines(2) }}
          title={book.title}
        >
          {book.title}
        </Typography>
        <Typography
          color="text.secondary"
          variant="caption"
          component="p"
          sx={clampLines(2)}
          title={authors}
        >
          {authors}
        </Typography>
      </Link>
    </Box>
  );
};

export default BookCard;
