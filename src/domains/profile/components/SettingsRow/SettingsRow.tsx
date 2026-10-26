import type { ReactNode } from "react";
import { Link } from "react-router";
import ButtonBase from "@mui/material/ButtonBase";
import type { ButtonBaseProps } from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";

interface SettingsRowProps extends Omit<ButtonBaseProps, "children" | "href"> {
  label: string;
  // Valor actual a la derecha, en gris (Vista de biblioteca, Tema…).
  value?: string;
  // Si se indica, la fila es un enlace a otra pantalla; si no, un botón.
  to?: string;
  // Sustituye al chevron cuando la fila es una acción y no un destino.
  endIcon?: ReactNode;
}

const Chevron = () => (
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
    <path d="M9 18l6-6-6-6" />
  </svg>
);

// Fila de Perfil: etiqueta a la izquierda y, a la derecha, el valor en gris y
// el chevron. Va dentro de un `SettingsGroup`, que pone el fondo y las líneas.
const SettingsRow = ({
  label,
  value,
  to,
  endIcon,
  sx,
  ...props
}: SettingsRowProps) => (
  <ButtonBase
    {...(to ? { component: Link, to } : {})}
    {...props}
    sx={[
      {
        width: "100%",
        minHeight: 56,
        px: 4,
        gap: 2,
        justifyContent: "space-between",
        textAlign: "left",
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <Typography>{label}</Typography>
    <Typography
      component="span"
      color="text.secondary"
      sx={{ display: "flex", alignItems: "center", gap: 1 }}
    >
      {value}
      {endIcon ?? <Chevron />}
    </Typography>
  </ButtonBase>
);

export default SettingsRow;
