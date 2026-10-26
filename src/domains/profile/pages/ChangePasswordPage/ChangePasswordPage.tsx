import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "../../../../components/ui/Button/Button";
import PasswordStrengthChecklist from "../../../../components/ui/PasswordStrengthChecklist/PasswordStrengthChecklist";
import { useChangePasswordMutation } from "../../../auth/authApi";
import { getFormErrorMessage } from "../../../auth/utils/getFormErrorMessage";
import { parseApiError } from "../../../auth/utils/parseApiError";
import CardField from "../../components/CardField/CardField";
import EditScreen from "../../components/EditScreen/EditScreen";
import SettingsGroup from "../../components/SettingsGroup/SettingsGroup";
import { changePasswordSchema } from "./changePasswordSchema";
import type { ChangePasswordFormValues } from "./changePasswordSchema";

// Cambiar la contraseña desde Perfil (HU-44): pide la actual y la nueva con los
// mismos requisitos que el registro.
const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [isNewPasswordFocused, setIsNewPasswordFocused] = useState(false);
  const {
    register: field,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onSubmit",
    defaultValues: { currentPassword: "", newPassword: "" },
  });
  const newPassword = useWatch({ control, name: "newPassword" });
  const newPasswordField = field("newPassword");

  const onSubmit = async (values: ChangePasswordFormValues) => {
    setFormError(null);
    const result = await changePassword(values);

    if (!result.error) {
      setIsDone(true);
      return;
    }

    const apiError = parseApiError(result.error);

    if (apiError?.code === "AUTH_INVALID_CREDENTIALS") {
      setError("currentPassword", { message: apiError.message });
      return;
    }

    if (apiError?.field === "newPassword") {
      setError("newPassword", { message: apiError.message });
      return;
    }

    setFormError(
      getFormErrorMessage(
        result.error,
        "No se pudo cambiar la contraseña. Inténtalo de nuevo.",
      ),
    );
  };

  if (isDone) {
    return (
      <EditScreen title="Cambiar contraseña" backTo="/profile/edit">
        <Typography
          role="status"
          color="text.secondary"
          sx={{ textAlign: "center" }}
        >
          Contraseña actualizada. Hemos cerrado tus otras sesiones abiertas.
        </Typography>
        <Button fullWidth onClick={() => void navigate("/profile/edit")}>
          Listo
        </Button>
      </EditScreen>
    );
  }

  return (
    <EditScreen title="Cambiar contraseña" backTo="/profile/edit">
      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        sx={{ display: "grid", gap: 6 }}
      >
        {formError && <Alert severity="error">{formError}</Alert>}
        <Box sx={{ display: "grid", gap: 3 }}>
          <SettingsGroup>
            <CardField
              label="Contraseña actual"
              type="password"
              autoComplete="current-password"
              error={errors.currentPassword?.message}
              {...field("currentPassword")}
            />
            <CardField
              label="Contraseña nueva"
              type="password"
              autoComplete="new-password"
              error={errors.newPassword?.message}
              {...newPasswordField}
              onFocus={() => setIsNewPasswordFocused(true)}
              onBlur={async (event) => {
                setIsNewPasswordFocused(false);
                await newPasswordField.onBlur(event);
              }}
            />
          </SettingsGroup>
          <PasswordStrengthChecklist
            password={newPassword}
            isVisible={isNewPasswordFocused || newPassword !== ""}
          />
        </Box>
        <Button type="submit" fullWidth disabled={isLoading}>
          {isLoading ? "Guardando…" : "Cambiar contraseña"}
        </Button>
      </Box>
    </EditScreen>
  );
};

export default ChangePasswordPage;
