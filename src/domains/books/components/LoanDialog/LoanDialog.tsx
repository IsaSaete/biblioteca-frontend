import { useState } from "react";
import type { MouseEvent } from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import BottomSheet from "../../../../components/ui/BottomSheet/BottomSheet";
import Button from "../../../../components/ui/Button/Button";
import FloatingLabelInput from "../../../../components/ui/FloatingLabelInput/FloatingLabelInput";

export const MAX_BORROWER_NAME_LENGTH = 80;

interface LoanDialogProps {
  open: boolean;
  title: string;
  // Nombre actual al cambiarlo; vacío al prestar.
  initialName?: string;
  isPending: boolean;
  hasFailed: boolean;
  onSave: (borrowerName: string) => void;
  onCancel: () => void;
}

interface LoanFormProps extends Omit<LoanDialogProps, "open" | "title"> {
  idPrefix: string;
}

// En el móvil, tocar un botón con el teclado abierto lo cierra y la hoja se
// recoloca antes de que llegue el «click»: había que pulsar dos veces. Con el
// campo sin perder el foco, el primer toque ya guarda o cancela.
const keepKeyboardOpen = (event: MouseEvent<HTMLElement>) =>
  event.preventDefault();

// Un solo campo: a quién se le presta. Sin fecha de devolución (D-049).
const LoanForm = ({
  idPrefix,
  initialName = "",
  isPending,
  hasFailed,
  onSave,
  onCancel,
}: LoanFormProps) => {
  const [name, setName] = useState(initialName);
  const trimmed = name.trim();

  return (
    <Box
      component="form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();

        if (trimmed) {
          onSave(trimmed);
        }
      }}
      sx={{ display: "grid", gap: 3, pt: 1 }}
    >
      <FloatingLabelInput
        id={`${idPrefix}-name`}
        label="¿A quién se lo prestas?"
        value={name}
        onChange={(event) => setName(event.target.value)}
        error={hasFailed}
        helperText={hasFailed ? "No se pudo guardar. Inténtalo de nuevo." : ""}
        slotProps={{ htmlInput: { maxLength: MAX_BORROWER_NAME_LENGTH } }}
        // Es el único campo y el motivo de abrir la hoja.
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
      />
      <Box sx={{ display: "grid", gap: 2 }}>
        <Button
          type="submit"
          disabled={!trimmed || isPending}
          onMouseDown={keepKeyboardOpen}
        >
          {isPending ? "Guardando…" : "Guardar"}
        </Button>
        <Button
          variant="text"
          disabled={isPending}
          onMouseDown={keepKeyboardOpen}
          onClick={onCancel}
        >
          Cancelar
        </Button>
      </Box>
    </Box>
  );
};

// Hoja inferior en móvil (menos de 768 px) y diálogo centrado desde tablet,
// como las confirmaciones (D-031). El formulario se monta al abrir, así que
// siempre empieza con el nombre actual.
const LoanDialog = ({ open, title, ...formProps }: LoanDialogProps) => {
  const theme = useTheme();
  const isWide = useMediaQuery(theme.breakpoints.up("sm"));

  if (!isWide) {
    return (
      <BottomSheet open={open} title={title} onClose={formProps.onCancel}>
        <Box sx={{ mt: 3 }}>
          <LoanForm idPrefix="loan-sheet" {...formProps} />
        </Box>
      </BottomSheet>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={formProps.onCancel}
      aria-labelledby="loan-dialog-title"
      fullWidth
      maxWidth={false}
      slotProps={{ paper: { sx: { maxWidth: 400, borderRadius: "20px" } } }}
    >
      <DialogTitle
        id="loan-dialog-title"
        sx={{ fontSize: "1rem", fontWeight: 500, pt: 5, px: 5, pb: 2 }}
      >
        {title}
      </DialogTitle>
      <DialogContent sx={{ px: 5, pb: 5, pt: 2 }}>
        <Box sx={{ pt: 1 }}>
          <LoanForm idPrefix="loan-dialog" {...formProps} />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LoanDialog;
