import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";

interface BottomSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  // Botón «Cerrar» (✕) junto al título, para hojas con contenido largo.
  showCloseButton?: boolean;
  children: ReactNode;
}

// Hoja inferior parcial para decisiones cortas (1-2 opciones, o pocas más).
const BottomSheet = ({
  open,
  title,
  onClose,
  showCloseButton = false,
  children,
}: BottomSheetProps) => (
  <Drawer
    anchor="bottom"
    open={open}
    onClose={onClose}
    slotProps={{
      paper: {
        role: "dialog",
        "aria-label": title,
        sx: {
          borderTopLeftRadius: "20px",
          borderTopRightRadius: "20px",
          maxWidth: 480,
          mx: "auto",
          pb: "env(safe-area-inset-bottom)",
          // Un contenido largo hace scroll dentro de la hoja.
          maxHeight: "85dvh",
        },
      },
    }}
  >
    <Box
      sx={{
        px: 4,
        pt: 5,
        pb: 4,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
        {showCloseButton && (
          <IconButton
            aria-label="Cerrar"
            onClick={onClose}
            sx={{ width: 44, height: 44, mr: -2, mt: -3 }}
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
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </IconButton>
        )}
      </Box>
      {children}
    </Box>
  </Drawer>
);

export default BottomSheet;
