import { Link as RouterLink } from "react-router";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import ButtonBase from "@mui/material/ButtonBase";
import type { Loan } from "../../dto/Ejemplar";
import type { SavedBook } from "../../dto/SavedBook";
import { visuallyHidden } from "../../../../utils/visuallyHidden";
import { capitalizeName } from "../../utils/capitalizeFirst";
import BookCover from "../BookCover/BookCover";
import LentBadge from "../LentBadge/LentBadge";

interface BookCardProps {
  book: Pick<SavedBook, "id" | "title" | "authors" | "coverUrl"> & {
    loan?: Loan;
  };
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
        sx={{
          display: "block",
          borderRadius: 1.5,
          width: "100%",
          textAlign: "left",
        }}
      >
        <Box sx={{ position: "relative" }}>
          <BookCover title={book.title} coverUrl={book.coverUrl} decorative />
          {book.loan && (
            <LentBadge
              size={24}
              sx={{ position: "absolute", top: 6, right: 6 }}
            />
          )}
        </Box>
        <Typography
          sx={{ mt: 2, fontWeight: 700, ...clampLines(2) }}
          title={book.title}
        >
          {book.title}
        </Typography>
        {book.loan && (
          <Box component="span" sx={visuallyHidden}>
            Prestado a {capitalizeName(book.loan.borrowerName)}
          </Box>
        )}
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
