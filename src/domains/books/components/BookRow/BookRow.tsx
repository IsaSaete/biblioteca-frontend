import { Link as RouterLink } from "react-router";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import type { PillTone } from "../../../../components/ui/Pill/Pill";
import type { LibraryBook } from "../../dto/LibraryBook";
import { getStatusPresentation } from "../../utils/statusOptions";
import { capitalizeName } from "../../utils/capitalizeFirst";
import BookCover from "../BookCover/BookCover";
import LentBadge from "../LentBadge/LentBadge";

interface BookRowProps {
  book: LibraryBook;
}

const COVER_WIDTH = 56;

// Color del punto de estado: el mismo tono que su pastilla en la ficha.
const toneColors: Record<PillTone, string> = {
  neutral: "text.secondary",
  accent: "primary.main",
  success: "success.main",
  danger: "error.main",
};

const clampLines = (lines: number) => ({
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: lines,
  overflow: "hidden",
  overflowWrap: "anywhere",
});

// Fila de la vista lista: portada pequeña a la izquierda y, a la derecha, el
// título en negrita, el autor y el estado de lectura. Toda la fila lleva a la
// ficha del libro.
const BookRow = ({ book }: BookRowProps) => {
  const authors = book.authors.join(", ");
  const { label, tone } = getStatusPresentation(book.status);

  return (
    <Box
      component="li"
      sx={{
        listStyle: "none",
        minWidth: 0,
        borderBottom: 1,
        borderColor: "secondary.main",
      }}
    >
      <Link
        component={RouterLink}
        to={`/library/${book.id}`}
        underline="none"
        color="inherit"
        sx={{ display: "flex", gap: 4, py: 3, borderRadius: 1.5 }}
      >
        <Box sx={{ width: COVER_WIDTH, flexShrink: 0 }}>
          <BookCover
            title={book.title}
            coverUrl={book.coverUrl}
            size="small"
            decorative
          />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1, alignSelf: "center" }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
            <Typography
              sx={{ fontWeight: 700, flex: 1, minWidth: 0, ...clampLines(2) }}
              title={book.title}
            >
              {book.title}
            </Typography>
            {book.loan && <LentBadge size={20} sx={{ mt: "1px" }} />}
          </Box>
          <Typography
            color="text.secondary"
            variant="caption"
            component="p"
            sx={clampLines(1)}
            title={authors}
          >
            {authors}
          </Typography>
          <Box
            sx={{
              mt: 1,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              fontSize: "0.75rem",
            }}
          >
            <Box
              component="span"
              aria-hidden="true"
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: toneColors[tone],
              }}
            />
            {label}
          </Box>
          {book.loan && (
            <Typography
              color="text.secondary"
              sx={{ mt: 0.5, fontSize: "0.75rem", ...clampLines(1) }}
            >
              Prestado a {capitalizeName(book.loan.borrowerName)}
            </Typography>
          )}
        </Box>
      </Link>
    </Box>
  );
};

export default BookRow;
