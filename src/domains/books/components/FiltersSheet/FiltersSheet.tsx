import { useState } from "react";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import BottomSheet from "../../../../components/ui/BottomSheet/BottomSheet";
import Button from "../../../../components/ui/Button/Button";
import FloatingLabelInput from "../../../../components/ui/FloatingLabelInput/FloatingLabelInput";
import InlineError from "../../../../components/ui/InlineError/InlineError";
import SheetOption from "../../../../components/ui/SheetOption/SheetOption";
import { normalizeText } from "../../../../utils/normalizeText";
import { useGetBookTagsQuery } from "../../booksApi";
import { getShowLabel } from "../../utils/getShowLabel";
import { hasActiveFilters, NO_FILTERS } from "../../utils/libraryFilters";
import type { LibraryFilterSelection } from "../../utils/libraryFilters";

// Con más etiquetas que estas, aparece un buscador para no depender del scroll.
const SEARCH_THRESHOLD = 12;

interface FiltersSheetProps {
  open: boolean;
  selection: LibraryFilterSelection;
  // Libros que cumplen lo elegido ahora (`undefined` mientras se calcula).
  total: number | undefined;
  // Cada toque se aplica en el momento: la biblioteca de fondo ya cambia.
  onChange: (selection: LibraryFilterSelection) => void;
  onClose: () => void;
}

const SectionTitle = ({ children }: { children: string }) => (
  <Typography
    component="h3"
    color="text.secondary"
    sx={{ fontSize: "0.875rem", fontWeight: 500, mb: 2 }}
  >
    {children}
  </Typography>
);

// Hoja «Filtros» de Biblioteca (HU-12): Favoritos (un interruptor), todas las
// etiquetas en uso (en lista, con su número) y «Sin catalogar», juntos en una
// sola hoja. Los filtros se
// aplican al tocar cada fila; «Ver X libros» solo cierra la hoja. La API admite
// una sola etiqueta: elegir otra cambia la anterior, y «Sin catalogar» no se
// combina con ellas. Favoritos se combina con cualquiera.
const FiltersSheet = ({
  open,
  selection,
  total,
  onChange,
  onClose,
}: FiltersSheetProps) => {
  const [query, setQuery] = useState("");
  const { data, isLoading, isError, refetch } = useGetBookTagsQuery(undefined, {
    skip: !open,
  });
  const tags = data?.items ?? [];
  const untaggedCount = data?.untaggedCount ?? 0;
  const isSearching = query.trim() !== "";
  const visibleTags = tags.filter((item) =>
    normalizeText(item.tag).includes(normalizeText(query.trim())),
  );

  const close = () => {
    setQuery("");
    onClose();
  };

  const toggleTag = (tag: string, isSelected: boolean) =>
    onChange({
      ...selection,
      tag: isSelected ? undefined : tag,
      untagged: false,
    });

  const renderTags = () => {
    if (isLoading) {
      return (
        <Typography color="text.secondary">Cargando tus etiquetas…</Typography>
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

    if (tags.length === 0 && untaggedCount === 0) {
      return (
        <Typography color="text.secondary">
          Aún no tienes etiquetas. Añádelas desde la ficha de cada libro.
        </Typography>
      );
    }

    return (
      <Box sx={{ display: "grid", gap: 3 }}>
        {tags.length > SEARCH_THRESHOLD && (
          <FloatingLabelInput
            label="Buscar una etiqueta"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        )}
        <Box sx={{ display: "grid" }}>
          {visibleTags.map((item) => {
            const isSelected =
              !selection.untagged &&
              normalizeText(selection.tag ?? "") === normalizeText(item.tag);

            return (
              <SheetOption
                key={item.tag}
                label={item.tag}
                count={item.count}
                selected={isSelected}
                onClick={() => toggleTag(item.tag, isSelected)}
              />
            );
          })}
          {!isSearching && (untaggedCount > 0 || selection.untagged) && (
            <SheetOption
              label="Sin catalogar"
              count={untaggedCount}
              selected={selection.untagged}
              onClick={() =>
                onChange({
                  ...selection,
                  tag: undefined,
                  untagged: !selection.untagged,
                })
              }
            />
          )}
        </Box>
        {isSearching && visibleTags.length === 0 && (
          <Typography color="text.secondary">
            Ninguna etiqueta coincide.
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <BottomSheet open={open} title="Filtros" onClose={close} showCloseButton>
      <Box
        sx={{
          mt: 4,
          display: "flex",
          flexDirection: "column",
          gap: 5,
          overflowY: "auto",
          minHeight: 0,
          // Sitio para el contorno de enfoque de los chips de los bordes.
          mx: -1,
          px: 1,
          py: 1,
        }}
      >
        <FormControlLabel
          label="Favoritos"
          labelPlacement="start"
          checked={selection.favorite}
          onChange={(_event, checked) =>
            onChange({ ...selection, favorite: checked })
          }
          control={<Switch />}
          sx={{ m: 0, px: 2, minHeight: 48, justifyContent: "space-between" }}
        />
        <Box>
          <SectionTitle>Etiquetas</SectionTitle>
          {renderTags()}
        </Box>
      </Box>
      <Box sx={{ display: "grid", gap: 1, pt: 4 }}>
        <Button onClick={close} sx={{ minHeight: 48 }}>
          {getShowLabel(total)}
        </Button>
        <Button
          variant="text"
          disabled={!hasActiveFilters(selection)}
          onClick={() => onChange({ ...NO_FILTERS })}
        >
          Limpiar
        </Button>
      </Box>
    </BottomSheet>
  );
};

export default FiltersSheet;
