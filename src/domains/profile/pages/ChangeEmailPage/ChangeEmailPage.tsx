import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "../../../../components/ui/Button/Button";
import {
  useMeQuery,
  useRequestEmailChangeMutation,
} from "../../../auth/authApi";
import { getFormErrorMessage } from "../../../auth/utils/getFormErrorMessage";
import { parseApiError } from "../../../auth/utils/parseApiError";
import CardField from "../../components/CardField/CardField";
import EditScreen from "../../components/EditScreen/EditScreen";
import SettingsGroup from "../../components/SettingsGroup/SettingsGroup";
import { changeEmailSchema } from "./changeEmailSchema";
import type { ChangeEmailFormValues } from "./changeEmailSchema";

// Cambiar el email desde Perfil (HU-45). No se aplica hasta que se confirma el
// enlace enviado al email nuevo: una errata no puede dejar a nadie fuera.
const ChangeEmailPage = () => {
  const navigate = useNavigate();
  const { data } = useMeQuery();
  const [requestEmailChange, { isLoading }] = useRequestEmailChangeMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const {
    register: field,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ChangeEmailFormValues>({
    resolver: zodResolver(changeEmailSchema),
    mode: "onSubmit",
    defaultValues: { newEmail: "", currentPassword: "" },
  });

  const onSubmit = async (values: ChangeEmailFormValues) => {
    setFormError(null);

    if (values.newEmail.toLowerCase() === data?.user.email.toLowerCase()) {
      setError("newEmail", { message: "Ese ya es tu email" });
      return;
    }

    const result = await requestEmailChange(values);

    if (!result.error) {
      setSentTo(values.newEmail);
      return;
    }

    const apiError = parseApiError(result.error);

    if (apiError?.code === "AUTH_INVALID_CREDENTIALS") {
      setError("currentPassword", { message: apiError.message });
      return;
    }

    if (
      apiError?.code === "AUTH_EMAIL_TAKEN" ||
      apiError?.field === "newEmail"
    ) {
      setError("newEmail", { message: apiError.message });
      return;
    }

    setFormError(
      getFormErrorMessage(
        result.error,
        "No se pudo enviar el enlace. Inténtalo de nuevo.",
      ),
    );
  };

  if (sentTo) {
    return (
      <EditScreen title="Cambiar email" backTo="/profile/edit">
        <Typography
          role="status"
          color="text.secondary"
          sx={{ textAlign: "center" }}
        >
          Hemos enviado un enlace a {sentTo}. Tu email no cambiará hasta que lo
          abras para confirmarlo.
        </Typography>
        <Button fullWidth onClick={() => void navigate("/profile/edit")}>
          Entendido
        </Button>
      </EditScreen>
    );
  }

  return (
    <EditScreen title="Cambiar email" backTo="/profile/edit">
      {data && (
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: "grid", gap: 6 }}
        >
          <Typography color="text.secondary" sx={{ textAlign: "center" }}>
            Te enviaremos un enlace al email nuevo. El cambio se aplica cuando
            lo confirmes.
          </Typography>
          {formError && <Alert severity="error">{formError}</Alert>}
          <SettingsGroup>
            <CardField
              label="Email nuevo"
              type="email"
              autoComplete="email"
              error={errors.newEmail?.message}
              {...field("newEmail")}
            />
            <CardField
              label="Tu contraseña"
              type="password"
              autoComplete="current-password"
              error={errors.currentPassword?.message}
              {...field("currentPassword")}
            />
          </SettingsGroup>
          <Button type="submit" fullWidth disabled={isLoading}>
            {isLoading ? "Enviando…" : "Enviar enlace"}
          </Button>
        </Box>
      )}
    </EditScreen>
  );
};

export default ChangeEmailPage;
