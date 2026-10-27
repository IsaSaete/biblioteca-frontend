import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

interface FullScreenModalProps {
  titleId: string;
  onClose?: () => void;
  onBack?: () => void;
  children: ReactNode;
}

// Pantalla completa en móvil y diálogo centrado de ~480px desde 768px
// (pantallas-y-flujos.md, «Reglas de adaptación a escritorio»). Sin `onClose`
// no hay botón de cierre ni se cierra con Esc o con el fondo: una «X» que no
// lleva a ninguna parte no se muestra.
const FullScreenModal = ({
  titleId,
  onClose,
  onBack,
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
          // `backgroundImage: "none"` quita el degradado de elevación que MUI
          // pone en modo oscuro y que aclara el fondo hacia un gris.
          sx: isMobile
            ? { backgroundImage: "none" }
            : { maxWidth: 480, borderRadius: "20px", backgroundImage: "none" },
        },
      }}
    >
      {(onClose || onBack) && (
        // Fila propia fuera de la zona con scroll: los botones no se solapan con
        // el contenido y respetan la zona del sistema (notch) con
        // `viewport-fit=cover`.
        <Box
          sx={{
            flex: "0 0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: 44,
            px: 2,
            pt: "calc(env(safe-area-inset-top) + 8px)",
          }}
        >
          {onBack ? (
            <IconButton
              aria-label="Volver"
              onClick={onBack}
              sx={{ width: 44, height: 44 }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </IconButton>
          ) : (
            <span aria-hidden="true" />
          )}
          {onClose && (
            <IconButton
              aria-label="Cerrar"
              onClick={onClose}
              sx={{ width: 44, height: 44 }}
            >
              <svg
                width={isMobile ? 24 : 20}
                height={isMobile ? 24 : 20}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </IconButton>
          )}
        </Box>
      )}
      <DialogContent
        sx={{ px: 4, pb: 6, pt: onClose || onBack ? 2 : 6, flex: "1 1 auto" }}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default FullScreenModal;
