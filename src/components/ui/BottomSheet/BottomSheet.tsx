import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";

interface BottomSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

// Hoja inferior parcial para decisiones cortas (1-2 opciones, o pocas más).
const BottomSheet = ({ open, title, onClose, children }: BottomSheetProps) => (
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
        },
      },
    }}
  >
    <Box sx={{ px: 4, pt: 5, pb: 4 }}>
      <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 500 }}>
        {title}
      </Typography>
      {children}
    </Box>
  </Drawer>
);

export default BottomSheet;
