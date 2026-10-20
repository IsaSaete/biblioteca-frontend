import type { ReactElement } from "react";
import Chip from "@mui/material/Chip";
import type { Theme } from "@mui/material/styles";

export type PillTone = "neutral" | "accent" | "success";

interface PillProps {
  label: string;
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
}

// Colores de cada tono. El texto no usa siempre el color del contorno: el
// terracota no llega a 4,5:1 como texto y el verde oscuro tampoco sobre su
// fondo suave, así que ahí se usa un tono legible (WCAG AA).
const getToneColors = (theme: Theme, tone: PillTone) => {
  const { palette } = theme.vars ?? theme;

  switch (tone) {
    case "success":
      return {
        border: palette.success.main,
        soft: palette.success.light,
        text: palette.success.main,
        textOnSoft: palette.text.primary,
      };
    case "neutral":
      return {
        border: palette.text.secondary,
        soft: palette.action.selected,
        text: palette.text.secondary,
        textOnSoft: palette.text.primary,
      };
    case "accent":
      return {
        border: palette.primary.main,
        soft: palette.secondary.main,
        text: palette.secondary.contrastText,
        textOnSoft: palette.secondary.contrastText,
      };
  }
};

// Cápsula tocable (inventario-componentes.md). Alto mínimo táctil de 44px.
// Sin `selected` es una acción sencilla: fondo suave y sin contorno visible.
const Pill = ({
  label,
  onClick,
  disabled,
  icon,
  selected,
  tone = "accent",
  fullWidth = false,
}: PillProps) => (
  <Chip
    label={label}
    icon={icon}
    onClick={onClick}
    disabled={disabled}
    aria-pressed={selected}
    sx={(theme) => {
      const colors = getToneColors(theme, tone);
      const isOutlined = selected === false;
      const background = isOutlined ? "transparent" : colors.soft;
      const textColor = isOutlined
        ? colors.text
        : selected
          ? colors.textOnSoft
          : colors.text;
      const borderColor = selected === undefined ? colors.soft : colors.border;

      return {
        height: 44,
        px: 3,
        borderRadius: "999px",
        fontSize: "0.875rem",
        width: fullWidth ? "100%" : undefined,
        justifyContent: "center",
        border: "1px solid",
        borderColor,
        backgroundColor: background,
        color: textColor,
        transition: "background-color 120ms, border-color 120ms, color 120ms",
        "& .MuiChip-icon": { color: "inherit" },
        "& .MuiTouchRipple-root": { display: "none" },
        // Sin cambio de color al pasar el ratón o tocar: era lo que hacía
        // parpadear la pastilla al seleccionarla.
        "&:hover, &:focus, &:active": { backgroundColor: background },
        "&.Mui-focusVisible": {
          backgroundColor: background,
          outline: "2px solid",
          outlineColor: colors.border,
          outlineOffset: 2,
        },
      };
    }}
  />
);

export default Pill;
