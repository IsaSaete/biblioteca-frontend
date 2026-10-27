import { Link as RouterLink } from "react-router";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import ButtonBase from "@mui/material/ButtonBase";
import type { SavedBook } from "../../dto/SavedBook";
import BookCover from "../BookCover/BookCover";

interface BookCardProps {
  book: Pick<SavedBook, "id" | "title" | "authors" | "coverUrl">;
  // Si se informa, la tarjeta es un botón que llama a esto en lugar de llevar a
  // la ficha (un deseado no tiene ficha).
  onSelect?: () => void;
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
// tarjeta lleva a la ficha del libro, o hace lo que diga `onSelect`.
const BookCard = ({ book, onSelect }: BookCardProps) => {
  const authors = book.authors.join(", ");
  const target = onSelect
    ? { component: ButtonBase, onClick: onSelect }
    : { component: RouterLink, to: `/library/${book.id}` };

  return (
    <Box component="li" sx={{ listStyle: "none", minWidth: 0 }}>
      <Link
        {...target}
        underline="none"
        color="inherit"
        aria-label={`${book.title}, ${authors}`}
        sx={{
          display: "block",
          borderRadius: 1.5,
          width: "100%",
          textAlign: "left",
        }}
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
