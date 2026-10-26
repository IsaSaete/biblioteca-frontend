import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { z } from "zod";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Pill from "../../../../components/ui/Pill/Pill";
import { useDeleteAccountMutation } from "../../../auth/authApi";
import { getFormErrorMessage } from "../../../auth/utils/getFormErrorMessage";
import { parseApiError } from "../../../auth/utils/parseApiError";
import CardField from "../../components/CardField/CardField";
import EditScreen from "../../components/EditScreen/EditScreen";
import ExportDataRow from "../../components/ExportDataRow/ExportDataRow";
import SettingsGroup from "../../components/SettingsGroup/SettingsGroup";

const deleteAccountSchema = z.object({
  password: z.string().min(1, "Escribe tu contraseña para confirmar"),
});

type DeleteAccountFormValues = z.infer<typeof deleteAccountSchema>;

// Eliminar la cuenta (HU-39): borrado inmediato y definitivo. Escribir la
// contraseña es la confirmación; antes se ofrece descargar los datos.
const DeleteAccountPage = () => {
  const navigate = useNavigate();
  const [deleteAccount, { isLoading }] = useDeleteAccountMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register: field,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<DeleteAccountFormValues>({
    resolver: zodResolver(deleteAccountSchema),
    mode: "onSubmit",
    defaultValues: { password: "" },
  });

  const onSubmit = async (values: DeleteAccountFormValues) => {
    setFormError(null);
    const result = await deleteAccount(values);

    if (!result.error) {
      await navigate("/login", {
        replace: true,
        state: { accountDeleted: true },
      });
      return;
    }

    const apiError = parseApiError(result.error);

    if (apiError?.code === "AUTH_INVALID_CREDENTIALS") {
      setError("password", { message: apiError.message });
      return;
    }

    setFormError(
      getFormErrorMessage(
        result.error,
        "No se pudo eliminar la cuenta. Inténtalo de nuevo.",
      ),
    );
  };

  return (
    <EditScreen title="Eliminar cuenta" backTo="/profile">
      <Box sx={{ display: "grid", gap: 6 }}>
        <Typography sx={{ textAlign: "center" }}>
          Se borrarán de forma definitiva tu cuenta, tu foto, tu biblioteca y
          todas tus citas. No se puede deshacer.
        </Typography>
        <SettingsGroup title="Antes de eliminar">
          <ExportDataRow />
        </SettingsGroup>
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: "grid", gap: 6 }}
        >
          {formError && <Alert severity="error">{formError}</Alert>}
          <SettingsGroup title="Confirma con tu contraseña">
            <CardField
              label="Tu contraseña"
              type="password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...field("password")}
            />
          </SettingsGroup>
          <Pill
            tone="danger"
            fullWidth
            label={isLoading ? "Eliminando…" : "Eliminar mi cuenta"}
            disabled={isLoading}
            onClick={() => void handleSubmit(onSubmit)()}
          />
        </Box>
      </Box>
    </EditScreen>
  );
};

export default DeleteAccountPage;
