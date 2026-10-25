import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";

interface SheetOptionProps {
  label: string;
  count?: number;
  selected: boolean;
  onClick: () => void;
}

// Fila de una opción dentro de una hoja inferior: nombre (con ✓ si es la
// elegida) y, opcionalmente, cuántos elementos tiene.
const SheetOption = ({ label, count, selected, onClick }: SheetOptionProps) => (
  <ButtonBase
    onClick={onClick}
    aria-pressed={selected}
    sx={{
      width: "100%",
      minHeight: 44,
      px: 2,
      justifyContent: "space-between",
      textAlign: "left",
      borderRadius: 1.5,
      gap: 3,
    }}
  >
    <Typography
      sx={{
        fontSize: "1rem",
        fontWeight: selected ? 500 : 400,
        overflowWrap: "anywhere",
      }}
    >
      {selected && <span aria-hidden="true">✓ </span>}
      {label}
    </Typography>
    {count !== undefined && (
      <Typography color="text.secondary" sx={{ fontSize: "0.875rem" }}>
        {count}
      </Typography>
    )}
  </ButtonBase>
);

export default SheetOption;
