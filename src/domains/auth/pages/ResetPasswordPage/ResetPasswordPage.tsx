import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "../../../../components/ui/Button/Button";
import FloatingLabelInput from "../../../../components/ui/FloatingLabelInput/FloatingLabelInput";
import PasswordStrengthChecklist from "../../../../components/ui/PasswordStrengthChecklist/PasswordStrengthChecklist";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import { useResetPasswordMutation } from "../../authApi";
import { useFieldValidation } from "../../hooks/useFieldValidation";
import { getFormErrorMessage } from "../../utils/getFormErrorMessage";
import { parseApiError } from "../../utils/parseApiError";
import { resetPasswordSchema } from "./resetPasswordSchema";
import type { ResetPasswordFormValues } from "./resetPasswordSchema";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [isTokenInvalid, setIsTokenInvalid] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onSubmit",
    defaultValues: { password: "" },
  });
  const {
    register: field,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = form;
  const validationHandlers = useFieldValidation(form);
  const passwordHandlers = validationHandlers("password");
  const password = useWatch({ control, name: "password" });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) {
      return;
    }

    setFormError(null);
    const result = await resetPassword({ token, newPassword: values.password });

    if (!result.error) {
      await navigate("/login", {
        replace: true,
        state: { passwordReset: true },
      });
      return;
    }

    const apiError = parseApiError(result.error);

    if (apiError?.code === "AUTH_INVALID_TOKEN") {
      setIsTokenInvalid(true);
      return;
    }

    if (apiError?.field === "newPassword") {
      setError("password", { message: apiError.message });
      return;
    }

    setFormError(
      getFormErrorMessage(
        result.error,
        "No se pudo guardar la contraseña. Inténtalo de nuevo.",
      ),
    );
  };

  if (!token || isTokenInvalid) {
    return (
      <AuthLayout
        title="Enlace no válido"
        subtitle="Este enlace ha caducado o ya se ha usado."
      >
        <Button fullWidth onClick={() => void navigate("/forgot-password")}>
          Solicitar un enlace nuevo
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Crea una nueva contraseña"
      subtitle="Elige una contraseña segura"
    >
      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        sx={{ display: "grid", gap: 5 }}
      >
        {formError && <Alert severity="error">{formError}</Alert>}

        <FloatingLabelInput
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          error={!!errors.password}
          helperText={errors.password?.message}
          {...field("password", {
            ...passwordHandlers,
            onBlur: async () => {
              setIsPasswordFocused(false);
              await passwordHandlers.onBlur();
            },
          })}
          onFocus={() => setIsPasswordFocused(true)}
        />
        <PasswordStrengthChecklist
          password={password}
          isVisible={isPasswordFocused || password !== ""}
        />

        <Button type="submit" fullWidth disabled={isLoading}>
          Guardar contraseña
        </Button>
      </Box>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
