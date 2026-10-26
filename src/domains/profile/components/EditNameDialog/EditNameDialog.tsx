import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "../../../../components/ui/Button/Button";
import FloatingLabelInput from "../../../../components/ui/FloatingLabelInput/FloatingLabelInput";
import FullScreenModal from "../../../../components/ui/FullScreenModal/FullScreenModal";
import { useUpdateProfileMutation } from "../../../auth/authApi";
import { useFieldValidation } from "../../../auth/hooks/useFieldValidation";
import { getFormErrorMessage } from "../../../auth/utils/getFormErrorMessage";
import { parseApiError } from "../../../auth/utils/parseApiError";
import { editNameSchema } from "./editNameSchema";
import type { EditNameFormValues } from "./editNameSchema";

interface EditNameDialogProps {
  currentName: string;
  onClose: () => void;
}

const TITLE_ID = "edit-name-title";

// Cambiar el nombre de la cuenta desde Perfil (HU-36).
const EditNameDialog = ({ currentName, onClose }: EditNameDialogProps) => {
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<EditNameFormValues>({
    resolver: zodResolver(editNameSchema),
    mode: "onSubmit",
    defaultValues: { name: currentName },
  });
  const {
    register: field,
    handleSubmit,
    setError,
    formState: { errors },
  } = form;
  const validationHandlers = useFieldValidation(form);

  const onSubmit = async ({ name }: EditNameFormValues) => {
    setFormError(null);

    if (name === currentName) {
      onClose();
      return;
    }

    const result = await updateProfile({ name });

    if (!result.error) {
      onClose();
      return;
    }

    const apiError = parseApiError(result.error);

    if (apiError?.code === "VALIDATION_ERROR" && apiError.field === "name") {
      setError("name", { message: apiError.message });
      return;
    }

    setFormError(
      getFormErrorMessage(
        result.error,
        "No se pudo guardar el nombre. Inténtalo de nuevo.",
      ),
    );
  };

  return (
    <FullScreenModal titleId={TITLE_ID} onClose={onClose}>
      <Box sx={{ display: "grid", gap: 5, pt: 4 }}>
        <Typography
          id={TITLE_ID}
          variant="h6"
          component="h2"
          sx={{ textAlign: "center" }}
        >
          Tu nombre
        </Typography>
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: "grid", gap: 5 }}
        >
          {formError && <Alert severity="error">{formError}</Alert>}
          <FloatingLabelInput
            label="Nombre"
            autoComplete="name"
            error={!!errors.name}
            helperText={errors.name?.message}
            {...field("name", validationHandlers("name"))}
          />
          <Box sx={{ display: "grid", gap: 2 }}>
            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? "Guardando…" : "Guardar"}
            </Button>
            <Button
              variant="text"
              fullWidth
              disabled={isLoading}
              onClick={onClose}
            >
              Cancelar
            </Button>
          </Box>
        </Box>
      </Box>
    </FullScreenModal>
  );
};

export default EditNameDialog;
