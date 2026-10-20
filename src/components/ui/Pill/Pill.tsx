import type { ReactElement } from "react";
import Chip from "@mui/material/Chip";

interface PillProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  icon?: ReactElement;
  // Si se informa, la cápsula es un interruptor: `true` la rellena en terracota
  // claro y `false` la deja solo con contorno.
  selected?: boolean;
}

// Cápsula tocable: mismo color siempre, nunca jerarquía por color
// (inventario-componentes.md). Alto mínimo táctil de 44px.
const Pill = ({ label, onClick, disabled, icon, selected }: PillProps) => (
  <Chip
    label={label}
    icon={icon}
    onClick={onClick}
    disabled={disabled}
    color="secondary"
    variant={selected === false ? "outlined" : "filled"}
    aria-pressed={selected}
    sx={{ height: 44, px: 3, borderRadius: "999px", fontSize: "0.875rem" }}
  />
);

export default Pill;
