import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import BottomSheet from "../BottomSheet/BottomSheet";
import Button from "../Button/Button";
import Pill from "../Pill/Pill";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  // Texto del botón que confirma («Sí, eliminar») y el que muestra mientras
  // se hace («Eliminando…»).
  confirmLabel: string;
  pendingLabel: string;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// Confirmación de una acción destructiva: hoja inferior en móvil (menos de
// 768px, al alcance del pulgar) y diálogo centrado desde tablet. En el diálogo
// el foco empieza en «Cancelar», para no borrar con un Enter sin querer.
const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel,
  pendingLabel,
  isPending,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const theme = useTheme();
  const isWide = useMediaQuery(theme.breakpoints.up("sm"));

  if (!isWide) {
    return (
      <BottomSheet open={open} title={title} onClose={onCancel}>
        <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>
          {description}
        </Typography>
        <Box sx={{ display: "grid", gap: 2 }}>
          <Pill
            tone="danger"
            label={isPending ? pendingLabel : confirmLabel}
            fullWidth
            disabled={isPending}
            onClick={onConfirm}
          />
          <Button
            variant="text"
            fullWidth
            disabled={isPending}
            onClick={onCancel}
          >
            Cancelar
          </Button>
        </Box>
      </BottomSheet>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      role="alertdialog"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      fullWidth
      maxWidth={false}
      slotProps={{ paper: { sx: { maxWidth: 400, borderRadius: "20px" } } }}
    >
      <DialogTitle
        id="confirm-dialog-title"
        sx={{ fontSize: "1rem", fontWeight: 500, pt: 5, px: 5, pb: 2 }}
      >
        {title}
      </DialogTitle>
      <DialogContent sx={{ px: 5 }}>
        <Typography
          id="confirm-dialog-description"
          color="text.secondary"
          sx={{ pt: 1 }}
        >
          {description}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 5, pb: 5, pt: 3, gap: 2 }}>
        <Button
          variant="text"
          autoFocus
          disabled={isPending}
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          color="error"
          disabled={isPending}
          onClick={onConfirm}
          sx={{ borderRadius: "999px", px: 4 }}
        >
          {isPending ? pendingLabel : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
