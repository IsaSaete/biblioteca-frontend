import Box from "@mui/material/Box";
import FilterChip from "../../../../components/ui/FilterChip/FilterChip";
import type { LibraryFilterSelection } from "../../utils/libraryFilters";

interface ActiveFiltersProps {
  selection: LibraryFilterSelection;
  onChange: (selection: LibraryFilterSelection) => void;
}

// Los filtros en uso, a la vista bajo la barra y quitables de un toque.
const ActiveFilters = ({ selection, onChange }: ActiveFiltersProps) => (
  <Box sx={{ mb: 4 }}>
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
      {selection.favorite && (
        <FilterChip
          label="Favoritos"
          selected
          removable
          onClick={() => onChange({ ...selection, favorite: false })}
        />
      )}
      {selection.untagged && (
        <FilterChip
          label="Sin catalogar"
          selected
          removable
          onClick={() => onChange({ ...selection, untagged: false })}
        />
      )}
      {!selection.untagged && selection.tag && (
        <FilterChip
          label={selection.tag}
          selected
          removable
          onClick={() => onChange({ ...selection, tag: undefined })}
        />
      )}
    </Box>
  </Box>
);

export default ActiveFilters;
