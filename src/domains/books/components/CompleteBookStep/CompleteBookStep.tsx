import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import Typography from "@mui/material/Typography";
import Button from "../../../../components/ui/Button/Button";
import { useLazyLookupIsbnQuery, useSearchExternalQuery } from "../../booksApi";
import type { ExternalBook } from "../../dto/ExternalBook";
import { completeBook, needsCompletion } from "../../utils/completeBook";
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
  const candidates = (data ?? []).slice(0, MAX_CANDIDATES);

  const handleChoose = async (candidate: ExternalBook) => {
    let chosen = candidate;

    if (needsCompletion(candidate) && candidate.isbn) {
      const result = await lookupIsbn(candidate.isbn, true);
      chosen = result.data ? completeBook(candidate, result.data) : candidate;
    }

    // Lo que solo sabía la ficha del ISBN (año, idioma…) no se pierde.
    onChosen({
      ...completeBook(chosen, book),
      ...(book.isbn && { isbn: book.isbn }),
    });
  };

  return (
    <Box sx={{ display: "grid", gap: 5 }}>
      <Typography>
        Esta edición tiene pocos datos. ¿Es alguno de estos? Elígelo y
        rellenaremos el libro con él.
      </Typography>

      <Box role="status" aria-live="polite">
        {(isFetching || isCompleting) && (
          <Typography color="text.secondary">
            {isCompleting ? "Buscando los datos del libro…" : "Buscando…"}
          </Typography>
        )}
      </Box>

      {!isFetching && candidates.length === 0 && (
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
