import { useNavigate, useSearchParams } from "react-router";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Button from "../../../../components/ui/Button/Button";
import InlineError from "../../../../components/ui/InlineError/InlineError";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import { useVerifyEmailQuery } from "../../authApi";
import { parseApiError } from "../../utils/parseApiError";

// Destino del enlace del correo de verificación (`/verify-email?token=`).
// Verificar el email es recomendado, no obligatorio: no bloquea el uso de la app.
const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { isLoading, isSuccess, error, refetch } = useVerifyEmailQuery(
    token ?? "",
    { skip: !token },
  );

  const goToApp = () => void navigate("/home");

  if (isLoading) {
    return (
      <AuthLayout
        title="Verificando tu correo"
        subtitle="Un momento, por favor"
      >
        <Box
          role="status"
          aria-label="Verificando"
          sx={{ display: "flex", justifyContent: "center" }}
        >
          <CircularProgress />
        </Box>
      </AuthLayout>
    );
  }

  if (isSuccess) {
    return (
      <AuthLayout
        title="Correo verificado"
        subtitle="Gracias por confirmar tu email"
      >
        <Button fullWidth onClick={goToApp}>
          Continuar
        </Button>
      </AuthLayout>
    );
  }

  // Sin token, o con un token caducado o ya usado.
  if (!token || parseApiError(error)?.code === "AUTH_INVALID_TOKEN") {
    return (
      <AuthLayout
        title="Enlace no válido"
        subtitle="Este enlace ha caducado o ya se ha usado."
      >
        <Typography color="text.secondary" sx={{ mb: 5, textAlign: "center" }}>
          Si ya verificaste tu correo, puedes seguir usando Glosa con
          normalidad.
        </Typography>
        <Button fullWidth onClick={goToApp}>
          Ir a Glosa
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="No hemos podido verificar tu correo"
      subtitle="Ha habido un problema de conexión"
    >
      <InlineError
        message="Comprueba tu conexión e inténtalo de nuevo."
        onRetry={() => void refetch()}
      />
    </AuthLayout>
  );
};

export default VerifyEmailPage;
