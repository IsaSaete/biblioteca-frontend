import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";

interface ToolbarButtonProps {
  children: ReactNode;
  icon?: ReactNode;
  // Flecha tras el texto: el botón abre una hoja con opciones.
  hasChevron?: boolean;
  // Cuenta de elementos activos (por ejemplo, filtros) en una insignia.
  badge?: number;
  ariaLabel?: string;
  onClick: () => void;
}

const ChevronDownIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 9l7 7 7-7" />
  </svg>
);

// Botón de las barras de herramientas de las listas (filtros y orden de
// Biblioteca y Citas): texto con su icono, flecha o insignia, sin fondo ni
// borde, para que la acción principal de la pantalla sea lo único con color. Mide
// 44px de alto para tocarlo bien; al pasar el ratón, un fondo muy suave.
const ToolbarButton = ({
  children,
  icon,
  hasChevron = false,
  badge = 0,
  ariaLabel,
  onClick,
}: ToolbarButtonProps) => (
  <ButtonBase
    onClick={onClick}
    aria-haspopup="dialog"
    aria-label={ariaLabel}
    sx={{
      minHeight: 44,
      maxWidth: "100%",
      px: 2,
      gap: 2,
      borderRadius: 2,
      color: "text.primary",
      fontSize: "0.875rem",
      fontWeight: 500,
      "&:hover": { bgcolor: "background.paper" },
      "&.Mui-focusVisible": {
        outline: "2px solid",
        outlineColor: "primary.main",
        outlineOffset: 2,
      },
    }}
  >
    {icon}
    <Box
      component="span"
      sx={{
        minWidth: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </Box>
    {badge > 0 && (
      <Box
        component="span"
        aria-hidden="true"
        sx={{
          minWidth: 20,
          height: 20,
          px: 1,
          borderRadius: "999px",
          display: "grid",
          placeItems: "center",
          bgcolor: "primary.main",
          color: "primary.contrastText",
          fontSize: "0.75rem",
        }}
      >
        {badge}
      </Box>
    )}
    {hasChevron && <ChevronDownIcon />}
  </ButtonBase>
);

export default ToolbarButton;
