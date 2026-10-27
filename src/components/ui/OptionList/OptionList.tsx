import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";

export interface Option {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

interface OptionListProps {
  options: Option[];
}

const ChevronIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 5l7 7-7 7" />
  </svg>
);

// Lista de caminos para elegir (Añadir libro, Añadir cita): cada fila lleva el
// icono en una columna fija a la izquierda, el texto a su lado y el chevron al
// final. Sin tarjeta de fondo: solo líneas finas entre filas y en los extremos.
const OptionList = ({ options }: OptionListProps) => (
  <Box
    sx={{
      borderTop: 1,
      borderBottom: 1,
      borderColor: "secondary.main",
      // `&&` sube la especificidad: sin ella, el `border: 0` de ButtonBase se
      // come la línea.
      "&& > * + *": { borderTop: 1, borderColor: "secondary.main" },
    }}
  >
    {options.map(({ icon, label, onClick }) => (
      <ButtonBase
        key={label}
        onClick={onClick}
        sx={{
          width: "100%",
          minHeight: 56,
          px: 4,
          gap: 3,
          justifyContent: "flex-start",
          textAlign: "left",
        }}
      >
        <Box component="span" sx={{ display: "flex", color: "primary.main" }}>
          {icon}
        </Box>
        <Typography component="span" sx={{ flexGrow: 1 }}>
          {label}
        </Typography>
        <Box component="span" sx={{ display: "flex", color: "text.secondary" }}>
          <ChevronIcon />
        </Box>
      </ButtonBase>
    ))}
  </Box>
);

export default OptionList;
