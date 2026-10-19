import type { ReactNode } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

interface FullScreenModalProps {
  titleId: string;
  onClose?: () => void;
  children: ReactNode;
}

// Pantalla completa en móvil y diálogo centrado de ~480px desde 768px
// (pantallas-y-flujos.md, «Reglas de adaptación a escritorio»). Sin `onClose`
// no hay botón de cierre ni se cierra con Esc o con el fondo: una «X» que no
// lleva a ninguna parte no se muestra.
const FullScreenModal = ({
  titleId,
  onClose,
  children,
}: FullScreenModalProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog
      open
      onClose={onClose}
      fullScreen={isMobile}
      fullWidth
      maxWidth={false}
      aria-labelledby={titleId}
      slotProps={{
        paper: {
          sx: isMobile ? undefined : { maxWidth: 480, borderRadius: "20px" },
        },
      }}
    >
      {onClose && (
        <IconButton
          aria-label="Cerrar"
          onClick={onClose}
          sx={{ position: "absolute", top: 8, right: 8, width: 44, height: 44 }}
        >
          <span aria-hidden="true">✕</span>
        </IconButton>
      )}
      <DialogContent sx={{ px: 4, py: 8 }}>{children}</DialogContent>
    </Dialog>
  );
};

export default FullScreenModal;
