import Chip from "@mui/material/Chip";

interface PillProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

// Cápsula tocable: mismo color siempre, nunca jerarquía por color
// (inventario-componentes.md). Alto mínimo táctil de 44px.
const Pill = ({ label, onClick, disabled }: PillProps) => (
  <Chip
    label={label}
    onClick={onClick}
    disabled={disabled}
    color="secondary"
    sx={{ height: 44, px: 3, borderRadius: "999px", fontSize: "0.875rem" }}
  />
);

export default Pill;
