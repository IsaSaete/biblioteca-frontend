import type { ReactElement, ReactNode } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import type { Theme } from "@mui/material/styles";

// `danger` es para acciones destructivas: solo contorno de alerta, sin relleno.
export type PillTone = "neutral" | "accent" | "success" | "danger";

interface PillProps {
  label: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  icon?: ReactElement;
  // Si se informa, la cápsula es un interruptor: `true` la rellena con el tono
  // suave y `false` la deja solo con contorno. El borde de 1px está siempre, así
  // que al cambiar de estado solo cambian los colores, nunca la forma.
  selected?: boolean;
  tone?: PillTone;
  // Ocupa todo el ancho disponible, con el contenido centrado.
  fullWidth?: boolean;
  // Solo contorno, sin ser un interruptor (no lleva `aria-pressed`): para
  // acciones que abren algo, como un filtro.
  outlined?: boolean;
  // Flecha tras el texto, centrada con él.
  endIcon?: "chevron-right" | "chevron-down";
  // Avisa a los lectores de pantalla de que abre un diálogo o una hoja.
  hasPopup?: boolean;
}

// Colores de cada tono. `outline` es el color del contorno y del texto sobre
// fondo transparente; `solid` / `onSolid` rellenan la pastilla seleccionada o
// de acción. El texto del contorno no usa siempre el color del relleno: el
// terracota claro no llega a 4,5:1 como texto sobre blanco y el verde tampoco,
// así que en contorno se usa un tono legible (WCAG AA).
const getToneColors = (theme: Theme, tone: PillTone) => {
  const { palette } = theme.vars ?? theme;

  switch (tone) {
    case "success":
      return {
        solid: palette.success.main,
        onSolid: palette.success.contrastText,
        outlineText: palette.success.main,
      };
    case "neutral":
      return {
        solid: palette.text.secondary,
        onSolid: palette.background.default,
        outlineText: palette.text.secondary,
      };
    case "danger":
      return {
        solid: palette.error.main,
        onSolid: palette.error.contrastText,
        outlineText: palette.error.main,
      };
    case "accent":
      return {
        solid: palette.primary.main,
        onSolid: palette.primary.contrastText,
        outlineText: palette.text.primary,
      };
  }
};

const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12.5l4.5 4.5L19 7" />
  </svg>
);

const ChevronIcon = ({ direction }: { direction: "right" | "down" }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={direction === "right" ? "M9 5l7 7-7 7" : "M5 9l7 7 7-7"} />
  </svg>
);

// Cápsula tocable (inventario-componentes.md). Alto mínimo táctil de 44px.
// Sin `selected` es una acción sencilla con el relleno sólido del tono. Con
// `selected` es un interruptor: seleccionada se rellena y lleva un ✓ (no depende
// solo del color), y sin seleccionar queda solo con contorno.
const Pill = ({
  label,
  onClick,
  disabled,
  icon,
  selected,
  tone = "accent",
  fullWidth = false,
  outlined = false,
  endIcon,
  hasPopup = false,
}: PillProps) => (
  <Chip
    label={
      endIcon ? (
        <Box
          component="span"
          sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}
        >
          {label}
          <ChevronIcon
            direction={endIcon === "chevron-down" ? "down" : "right"}
          />
        </Box>
      ) : (
        label
      )
    }
    icon={selected ? <CheckIcon /> : icon}
    onClick={onClick}
    disabled={disabled}
    aria-pressed={selected}
    aria-haspopup={hasPopup ? "dialog" : undefined}
    sx={(theme) => {
      const colors = getToneColors(theme, tone);
      const isOutlined = selected === false || outlined || tone === "danger";
      const background = isOutlined ? "transparent" : colors.solid;
      const textColor = isOutlined ? colors.outlineText : colors.onSolid;

      return {
        height: 44,
        px: 3,
        borderRadius: "999px",
        fontSize: "0.875rem",
        width: fullWidth ? "100%" : undefined,
        justifyContent: "center",
        border: "1px solid",
        borderColor: colors.solid,
        backgroundColor: background,
        color: textColor,
        transition: "background-color 120ms, border-color 120ms, color 120ms",
        "& .MuiChip-icon": { color: "inherit" },
        "& .MuiChip-label": { px: 0, display: "inline-flex" },
        "& .MuiTouchRipple-root": { display: "none" },
        // Sin cambio de color al pasar el ratón o tocar: era lo que hacía
        // parpadear la pastilla al seleccionarla.
        "&:hover, &:focus, &:active": { backgroundColor: background },
        "&.Mui-focusVisible": {
          backgroundColor: background,
          outline: "2px solid",
          outlineColor: colors.solid,
          outlineOffset: 2,
        },
      };
    }}
  />
);

export default Pill;
