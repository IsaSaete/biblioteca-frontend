import { useNavigate, useSearchParams } from "react-router";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Button from "../../../../components/ui/Button/Button";
import InlineError from "../../../../components/ui/InlineError/InlineError";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import { useMeQuery, useVerifyEmailQuery } from "../../authApi";
import { parseApiError } from "../../utils/parseApiError";
import { useDocumentTitle } from "../../../../hooks/useDocumentTitle";

// Destino del enlace del correo de verificación (`/verify-email?token=`).
// Verificar el email es recomendado, no obligatorio: no bloquea el uso de la app.
const VerifyEmailPage = () => {
  useDocumentTitle("Verificar email");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { isLoading, isSuccess, error, refetch } = useVerifyEmailQuery(
    token ?? "",
    { skip: !token },
  );

  // El enlace puede abrirse en otro navegador o dispositivo, sin sesión: abrir
  // una sesión solo por tener el correo sería un enlace mágico. Con sesión se
  // sigue a la app; sin ella, a iniciar sesión.
  const { data: session, isLoading: isSessionLoading } = useMeQuery();
  const hasSession = Boolean(session);

  const goToApp = () => void navigate("/home");
  const goToLogin = () => void navigate("/login");

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
        subtitle={
          hasSession || isSessionLoading
            ? "Gracias por confirmar tu email"
            : "Gracias por confirmar tu email. Inicia sesión para continuar."
        }
      >
        <Button
          fullWidth
          disabled={isSessionLoading}
          onClick={hasSession ? goToApp : goToLogin}
        >
          {hasSession || isSessionLoading ? "Continuar" : "Iniciar sesión"}
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
