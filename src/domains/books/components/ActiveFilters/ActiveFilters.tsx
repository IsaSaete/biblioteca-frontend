import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FilterChip from "../../../../components/ui/FilterChip/FilterChip";
import type { LibraryFilterSelection } from "../../utils/libraryFilters";

interface ActiveFiltersProps {
  selection: LibraryFilterSelection;
  total: number | undefined;
  onChange: (selection: LibraryFilterSelection) => void;
}

// Los filtros en uso, a la vista bajo la barra y quitables de un toque, con
// cuántos libros quedan.
const ActiveFilters = ({ selection, total, onChange }: ActiveFiltersProps) => (
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
    {total !== undefined && (
      <Typography
        color="text.secondary"
        role="status"
        sx={{ mt: 2, fontSize: "0.875rem" }}
      >
        {total === 1 ? "1 libro" : `${total} libros`}
      </Typography>
    )}
  </Box>
);

export default ActiveFilters;
