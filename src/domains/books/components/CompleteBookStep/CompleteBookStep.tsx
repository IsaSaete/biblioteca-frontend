import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import Typography from "@mui/material/Typography";
import Button from "../../../../components/ui/Button/Button";
import { useEffect } from "react";
import { useLazyLookupIsbnQuery, useSearchExternalQuery } from "../../booksApi";
import type { ExternalBook } from "../../dto/ExternalBook";
import {
  completeBook,
  isMissingOnlyCover,
  needsCompletion,
} from "../../utils/completeBook";
import BookCover from "../BookCover/BookCover";

const MAX_CANDIDATES = 3;

interface CompleteBookStepProps {
  // Ficha del ISBN, con pocos datos.
  book: ExternalBook;
  onChosen: (book: ExternalBook) => void;
  onSkip: () => void;
}

// El ISBN existe pero su ficha viene casi vacía. Se buscan por título las
// fichas completas y se deja elegir; nunca se elige sola, porque un título
// puede corresponder a varios libros distintos. El libro se guarda con el ISBN
// original, que es el del ejemplar que la persona tiene en la mano.
const CompleteBookStep = ({
  book,
  onChosen,
  onSkip,
}: CompleteBookStepProps) => {
  const { data, isFetching } = useSearchExternalQuery(book.title);
  const [lookupIsbn, { isFetching: isCompleting }] = useLazyLookupIsbnQuery();
  const onlyCoverMissing = isMissingOnlyCover(book);
  // Una ficha con el mismo ISBN no aporta nada, y si solo falta la portada
  // vale la pena ver solo las que la traen.
  const candidates = (data ?? [])
    .filter(
      (candidate) =>
        candidate.isbn !== book.isbn &&
        (!onlyCoverMissing || candidate.coverUrl),
    )
    .slice(0, MAX_CANDIDATES);

  // Si solo falta la portada y nadie la tiene, no hay nada que elegir.
  useEffect(() => {
    if (onlyCoverMissing && !isFetching && candidates.length === 0) {
      onSkip();
    }
  }, [onlyCoverMissing, isFetching, candidates.length, onSkip]);

  const handleChoose = async (candidate: ExternalBook) => {
    let chosen = candidate;

    if (needsCompletion(candidate) && candidate.isbn) {
      const result = await lookupIsbn(candidate.isbn, true);
      chosen = result.data ? completeBook(candidate, result.data) : candidate;
    }

    // Si ya tenía autor/a y editorial, se conservan: solo se toma lo que falta.
    if (onlyCoverMissing) {
      onChosen(completeBook(book, chosen));
      return;
    }

    // Lo que solo sabía la ficha del ISBN (año, idioma…) no se pierde.
    onChosen({
      ...completeBook(chosen, book),
      ...(book.isbn && { isbn: book.isbn }),
    });
  };

  // Mientras busca solo se ve la carga: el mensaje y las fichas salen a la vez,
  // para que el texto no parpadee y parezca que se pierde.
  if (isFetching) {
    return (
      <Box
        role="status"
        sx={{ display: "grid", justifyItems: "center", gap: 3, py: 6 }}
      >
        <CircularProgress aria-hidden="true" />
        <Typography color="text.secondary">Buscando fichas…</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "grid", gap: 5 }}>
      <Typography>
        {onlyCoverMissing
          ? "No hemos encontrado la portada de esta edición. ¿Es alguno de estos? Elígelo y le pondremos su portada."
          : "Esta edición tiene pocos datos. ¿Es alguno de estos? Elígelo y rellenaremos el libro con él."}
      </Typography>

      {isCompleting && (
        <Box role="status">
          <Typography color="text.secondary">
            Buscando los datos del libro…
          </Typography>
        </Box>
      )}

      {candidates.length === 0 && (
        <Typography color="text.secondary">
          No hemos encontrado otras fichas con ese título.
        </Typography>
      )}

      {candidates.length > 0 && (
        <List
          aria-label="Fichas con el mismo título"
          disablePadding
          sx={{ display: "grid", gap: 2 }}
        >
          {candidates.map((candidate, index) => (
            <ListItemButton
              key={`${candidate.isbn ?? candidate.title}-${index}`}
              disabled={isCompleting}
              onClick={() => void handleChoose(candidate)}
              sx={{ gap: 4, minHeight: 44, borderRadius: 2 }}
            >
              <Box sx={{ width: 48, flexShrink: 0 }}>
                <BookCover
                  title={candidate.title}
                  coverUrl={candidate.coverUrl}
                  size="small"
                  decorative
                />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 500 }}>
                  {candidate.title}
                </Typography>
                <Typography color="text.secondary">
                  {candidate.authors.join(", ")}
                </Typography>
                {candidate.publisher && (
                  <Typography color="text.secondary">
                    {candidate.publisher}
                  </Typography>
                )}
              </Box>
            </ListItemButton>
          ))}
        </List>
      )}

      <Button variant="text" onClick={onSkip} disabled={isCompleting}>
        Ninguno, seguir con estos datos
      </Button>
    </Box>
  );
};

export default CompleteBookStep;
