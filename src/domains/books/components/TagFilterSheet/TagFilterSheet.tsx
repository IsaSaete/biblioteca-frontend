import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import BottomSheet from "../../../../components/ui/BottomSheet/BottomSheet";
import FloatingLabelInput from "../../../../components/ui/FloatingLabelInput/FloatingLabelInput";
import InlineError from "../../../../components/ui/InlineError/InlineError";
import SheetOption from "../../../../components/ui/SheetOption/SheetOption";
import { normalizeText } from "../../../../utils/normalizeText";
import { useGetBookTagsQuery } from "../../booksApi";

export interface TagSelection {
  tag?: string;
  untagged: boolean;
}

interface TagFilterSheetProps {
  open: boolean;
  selection: TagSelection;
  onSelect: (selection: TagSelection) => void;
  onClose: () => void;
}

const ALL_TAGS = "Todas las etiquetas";
const UNTAGGED = "Sin catalogar";
// La hoja nunca necesita scroll (mismo criterio que el filtro de citas por
// libro): se listan las más usadas y el resto se encuentra escribiendo.
const MAX_OPTIONS = 5;

// Selector de etiqueta del filtro de Biblioteca: solo las etiquetas que ya
// tienen algún libro (con su número), «Sin catalogar» para los libros sin
// ninguna, y un buscador propio.
const TagFilterSheet = ({
  open,
  selection,
  onSelect,
  onClose,
}: TagFilterSheetProps) => {
  const [query, setQuery] = useState("");
  const { data, isLoading, isError, refetch } = useGetBookTagsQuery(undefined, {
    skip: !open,
  });
  const isSearching = query.trim() !== "";
  const matches = (data?.items ?? []).filter((item) =>
    normalizeText(item.tag).includes(normalizeText(query.trim())),
  );
  const visibleTags = matches.slice(0, MAX_OPTIONS);
  const hiddenCount = matches.length - visibleTags.length;
  const untaggedCount = data?.untaggedCount ?? 0;

  const close = () => {
    setQuery("");
    onClose();
  };

  const choose = (next: TagSelection) => {
    onSelect(next);
    close();
  };

  const renderOptions = () => {
    if (isLoading) {
      return (
        <Typography color="text.secondary" sx={{ py: 3 }}>
          Cargando tus etiquetas…
        </Typography>
      );
    }

    if (isError || !data) {
      return (
        <InlineError
          message="No hemos podido cargar tus etiquetas."
          onRetry={() => void refetch()}
        />
      );
    }

    return (
      <Box sx={{ display: "grid" }}>
        {!isSearching && (
          <SheetOption
            label={ALL_TAGS}
            selected={!selection.tag && !selection.untagged}
            onClick={() => choose({ untagged: false })}
          />
        )}
        {visibleTags.map((item) => (
          <SheetOption
            key={item.tag}
            label={item.tag}
            count={item.count}
            selected={
              !selection.untagged &&
              normalizeText(selection.tag ?? "") === normalizeText(item.tag)
            }
            onClick={() => choose({ tag: item.tag, untagged: false })}
          />
        ))}
        {visibleTags.length === 0 && isSearching && (
          <Typography color="text.secondary" sx={{ py: 3 }}>
            Ninguna etiqueta coincide.
          </Typography>
        )}
        {hiddenCount > 0 && (
          <Typography
            color="text.secondary"
            sx={{ pt: 2, px: 2, fontSize: "0.875rem" }}
          >
            {isSearching
              ? `Hay ${hiddenCount} más: escribe más para afinar.`
              : "Escribe para buscar entre el resto de tus etiquetas."}
          </Typography>
        )}
        {!isSearching && (untaggedCount > 0 || selection.untagged) && (
          <SheetOption
            label={UNTAGGED}
            count={untaggedCount}
            selected={selection.untagged}
            onClick={() => choose({ untagged: true })}
          />
        )}
      </Box>
    );
  };

  return (
    <BottomSheet open={open} title="Filtrar por etiqueta" onClose={close}>
      <Box sx={{ display: "grid", gap: 3, mt: 3 }}>
        <FloatingLabelInput
          label="Buscar una etiqueta"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {renderOptions()}
      </Box>
    </BottomSheet>
  );
};

export default TagFilterSheet;
