import type { ReactNode } from "react";
import Popover from "@mui/material/Popover";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import BottomSheet, { SheetContent } from "../BottomSheet/BottomSheet";

interface OptionsPanelProps {
  open: boolean;
  title: string;
  onClose: () => void;
  // El botón que lo abre: en tablet y escritorio el panel sale debajo de él.
  anchorEl: HTMLElement | null;
  // Borde del botón al que se alinea: `end` para los del lado derecho, para que
  // el panel no se salga de la pantalla.
  align?: "start" | "end";
  // Botón «Cerrar» (✕) en la hoja del móvil; el panel anclado se cierra con Esc
  // o al pulsar fuera.
  showCloseButton?: boolean;
  children: ReactNode;
}

const PANEL_WIDTH = 360;

// Desplegable de opciones: hoja inferior en móvil (menos de 768px, al alcance
// del pulgar) y panel anclado bajo el botón desde tablet. Una hoja pegada al
// borde inferior de una pantalla ancha queda lejos del botón y rompe la
// relación entre el botón y lo que hace.
const OptionsPanel = ({
  open,
  title,
  onClose,
  anchorEl,
  align = "start",
  showCloseButton = false,
  children,
}: OptionsPanelProps) => {
  const theme = useTheme();
  const isWide = useMediaQuery(theme.breakpoints.up("sm"));

  if (!isWide || !anchorEl) {
    return (
      <BottomSheet
        open={open}
        title={title}
        onClose={onClose}
        showCloseButton={showCloseButton}
      >
        {children}
      </BottomSheet>
    );
  }

  const horizontal = align === "end" ? "right" : "left";

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal }}
      transformOrigin={{ vertical: "top", horizontal }}
      slotProps={{
        paper: {
          role: "dialog",
          "aria-label": title,
          sx: {
            mt: 1,
            width: PANEL_WIDTH,
            maxWidth: "calc(100vw - 32px)",
            maxHeight: "min(70vh, 520px)",
            display: "flex",
            flexDirection: "column",
            borderRadius: 2,
          },
        },
      }}
    >
      <SheetContent title={title} onClose={onClose}>
        {children}
      </SheetContent>
    </Popover>
  );
};

export default OptionsPanel;
