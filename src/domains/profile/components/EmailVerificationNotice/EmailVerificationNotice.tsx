import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "../../../../components/ui/Button/Button";
import {
  useMeQuery,
  useResendVerificationEmailMutation,
} from "../../../auth/authApi";
import { getFormErrorMessage } from "../../../auth/utils/getFormErrorMessage";
import { parseApiError } from "../../../auth/utils/parseApiError";

interface Outcome {
  severity: "success" | "error";
  text: string;
}

// Aviso de Perfil mientras el correo no está verificado. Verificarlo es
// recomendable (sin él, un correo mal escrito dejaría la cuenta sin forma de
// recuperar la contraseña) pero no obligatorio: nada se bloquea. Si no llegó el
// primer correo, se puede pedir otro.
const EmailVerificationNotice = () => {
  const { data, refetch } = useMeQuery();
  const [resend, { isLoading }] = useResendVerificationEmailMutation();
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  if (data?.user.emailVerified !== false) {
    return null;
  }

  const handleResend = async () => {
    setOutcome(null);
    const result = await resend();

    if (!result.error) {
      setOutcome({
        severity: "success",
        text: `Te hemos enviado un correo a ${data.user.email}. Si no lo ves, mira en la carpeta de spam.`,
      });
      return;
    }

    // Ya estaba verificado (por ejemplo, desde otro dispositivo): el aviso
    // desaparece al actualizar la sesión.
    if (parseApiError(result.error)?.code === "AUTH_EMAIL_ALREADY_VERIFIED") {
      void refetch();
      return;
    }

    setOutcome({
      severity: "error",
      text: getFormErrorMessage(
        result.error,
        "No pudimos enviar el correo. Inténtalo de nuevo.",
      ),
    });
  };

  // El botón va debajo del mensaje, en una sola línea: a la derecha del texto
  // se partía en dos en pantallas estrechas.
  return (
    <Alert
      severity={outcome?.severity ?? "info"}
      // Informa sin interrumpir: es un aviso, no un error.
      role="status"
      sx={{ "& .MuiAlert-message": { width: "100%" } }}
    >
      {outcome?.text ??
        "Tu correo aún no está verificado. Confírmalo para poder recuperar tu contraseña si la olvidas."}
      <Box sx={{ mt: 4 }}>
        <Button
          size="small"
          disabled={isLoading}
          aria-busy={isLoading}
          onClick={handleResend}
          sx={{
            borderRadius: "999px",
            minHeight: 34,
            py: 0,
            px: 4,
            whiteSpace: "nowrap",
          }}
        >
          {isLoading ? "Enviando…" : "Reenviar correo"}
        </Button>
      </Box>
    </Alert>
  );
};

export default EmailVerificationNotice;
