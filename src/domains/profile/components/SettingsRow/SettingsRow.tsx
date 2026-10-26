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
  // Una acción (Cerrar sesión) va centrada y sin chevron: sin destino a la
  // derecha, una etiqueta a la izquierda parecería una fila sin terminar.
  isAction?: boolean;
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
  isAction = false,
  sx,
  ...props
}: SettingsRowProps) => (
  <ButtonBase
    {...(to ? { component: Link, to } : {})}
    {...props}
    sx={[
      {
        width: "100%",
        minHeight: isAction ? 48 : 56,
        px: 4,
        gap: 2,
        justifyContent: isAction ? "center" : "space-between",
        textAlign: "left",
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <Typography
      sx={{
        flexShrink: 0,
        ...(isAction && { color: "primary.main" }),
      }}
    >
      {label}
    </Typography>
    {!isAction && (
      <Typography
        component="span"
        color="text.secondary"
        sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}
      >
        <Typography component="span" noWrap color="inherit">
          {value}
        </Typography>
        <Chevron />
      </Typography>
    )}
  </ButtonBase>
);

export default SettingsRow;
