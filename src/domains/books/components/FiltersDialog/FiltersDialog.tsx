import { useState } from "react";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import Button from "../../../../components/ui/Button/Button";
import FullScreenModal from "../../../../components/ui/FullScreenModal/FullScreenModal";
import Pill from "../../../../components/ui/Pill/Pill";
import { useGetBooksQuery } from "../../booksApi";
import {
  DEFAULT_SORT,
  hasActiveFilters,
  NO_FILTERS,
  toBooksParams,
} from "../../utils/libraryFilters";
import type { LibraryFilterSelection } from "../../utils/libraryFilters";
import { getShowLabel } from "../../utils/getShowLabel";
import TagFilterSheet from "../TagFilterSheet/TagFilterSheet";

interface FiltersDialogProps {
  applied: LibraryFilterSelection;
  onApply: (selection: LibraryFilterSelection) => void;
  onClose: () => void;
}

const TITLE_ID = "library-filters-title";

const getTagLabel = ({ tag, untagged }: LibraryFilterSelection): string => {
  if (untagged) {
    return "Sin catalogar";
  }

  return tag ?? "Todas";
};

// Pantalla «Filtros» de Biblioteca (HU-12): Etiqueta (fila que abre su
// selector) y Favorito (píldora). Lo elegido no se aplica hasta pulsar «Ver X
// libros»; «Restablecer» lo deja todo sin filtrar.
const FiltersDialog = ({ applied, onApply, onClose }: FiltersDialogProps) => {
  const [draft, setDraft] = useState<LibraryFilterSelection>({
    favorite: applied.favorite,
    tag: applied.tag,
    untagged: applied.untagged,
  });
  const [isTagSheetOpen, setIsTagSheetOpen] = useState(false);
  const { data, isFetching } = useGetBooksQuery(
    toBooksParams({ sort: DEFAULT_SORT, ...draft }),
  );
  const total = isFetching ? undefined : data?.total;

  return (
    <FullScreenModal titleId={TITLE_ID} onClose={onClose}>
      <Box
        sx={{
          minHeight: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 5,
        }}
      >
        <Typography
          id={TITLE_ID}
          component="h2"
          variant="h6"
          sx={{ textAlign: "center" }}
        >
          Filtros
        </Typography>

        <ButtonBase
          onClick={() => setIsTagSheetOpen(true)}
          aria-haspopup="dialog"
          sx={{
            width: "100%",
            minHeight: 56,
            px: 2,
            justifyContent: "space-between",
            borderRadius: 2,
          }}
        >
          <Typography>Etiqueta</Typography>
          <Typography color="text.secondary">{getTagLabel(draft)}</Typography>
        </ButtonBase>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
          }}
        >
          <Typography>Favorito</Typography>
          <Pill
            label="Solo favoritos"
            tone="accent"
            selected={draft.favorite}
            onClick={() =>
              setDraft((current) => ({
                ...current,
                favorite: !current.favorite,
              }))
            }
          />
        </Box>

        <Box
          sx={{
            mt: "auto",
            display: "grid",
            gap: 2,
            pt: 5,
          }}
        >
          <Button
            disabled={total === 0}
            onClick={() => onApply(draft)}
            sx={{ minHeight: 48 }}
          >
            {getShowLabel(total)}
          </Button>
          <Button
            variant="text"
            disabled={!hasActiveFilters(draft)}
            onClick={() => setDraft(NO_FILTERS)}
          >
            Restablecer
          </Button>
        </Box>
      </Box>

      <TagFilterSheet
        open={isTagSheetOpen}
        selection={draft}
        onSelect={({ tag, untagged }) =>
          setDraft((current) => ({ ...current, tag, untagged }))
        }
        onClose={() => setIsTagSheetOpen(false)}
      />
    </FullScreenModal>
  );
};

export default FiltersDialog;
