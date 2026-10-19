import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "../../../../components/ui/Button/Button";
import FloatingLabelInput from "../../../../components/ui/FloatingLabelInput/FloatingLabelInput";
import Pill from "../../../../components/ui/Pill/Pill";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import { useForgotPasswordMutation } from "../../authApi";
import { useFieldValidation } from "../../hooks/useFieldValidation";
import { getFormErrorMessage } from "../../utils/getFormErrorMessage";
import { forgotPasswordSchema } from "./forgotPasswordSchema";
import type { ForgotPasswordFormValues } from "./forgotPasswordSchema";

const MailIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);

const sendError = "No se pudo enviar el email. Inténtalo de nuevo.";

// Un único paso con dos estados: el formulario y, solo cuando el backend
// confirma el envío, «Revisa tu correo» (pantallas-y-flujos.md).
const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [wasResent, setWasResent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onSubmit",
    defaultValues: { email: "" },
  });
  const {
    register: field,
    handleSubmit,
    formState: { errors },
  } = form;
  const validationHandlers = useFieldValidation(form);

  const send = async (email: string): Promise<boolean> => {
    setFormError(null);
    const result = await forgotPassword({ email });

    if (result.error) {
      setFormError(getFormErrorMessage(result.error, sendError));
      return false;
    }

    return true;
  };

  const onSubmit = async ({ email }: ForgotPasswordFormValues) => {
    if (await send(email)) {
      setSentTo(email);
    }
  };

  const resend = async () => {
    setWasResent(false);

    if (sentTo && (await send(sentTo))) {
      setWasResent(true);
    }
  };

  const goBack = () => void navigate("/login");

  if (sentTo) {
    return (
      <AuthLayout
        title="Revisa tu correo"
        subtitle={`Si hay una cuenta con ${sentTo}, te hemos enviado un enlace para crear una nueva contraseña.`}
        onBack={goBack}
      >
        <Box
          sx={{
            display: "grid",
            justifyItems: "center",
            gap: 4,
            color: "primary.main",
          }}
        >
          <MailIcon />
          {formError && (
            <Alert severity="error" sx={{ width: "100%" }}>
              {formError}
            </Alert>
          )}
          {wasResent && (
            <Typography role="status" color="text.secondary">
              Email reenviado
            </Typography>
          )}
          <Pill label="Reenviar email" onClick={resend} disabled={isLoading} />
        </Box>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Recupera tu contraseña"
      subtitle="Te enviaremos un enlace para crear una nueva"
      onBack={goBack}
    >
      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        sx={{ display: "grid", gap: 5 }}
      >
        {formError && <Alert severity="error">{formError}</Alert>}

        <FloatingLabelInput
          label="Email"
          type="email"
          autoComplete="email"
          error={!!errors.email}
          helperText={errors.email?.message}
          {...field("email", validationHandlers("email"))}
        />

        <Button type="submit" fullWidth disabled={isLoading}>
          Enviar enlace
        </Button>
      </Box>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
