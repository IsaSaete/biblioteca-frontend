import { useNavigate, useSearchParams } from "react-router";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Button from "../../../../components/ui/Button/Button";
import InlineError from "../../../../components/ui/InlineError/InlineError";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import { useConfirmEmailChangeQuery } from "../../authApi";
import { parseApiError } from "../../utils/parseApiError";

// Destino del enlace que llega al email nuevo (`/confirm-email-change?token=`).
// Al confirmarse, el servidor cierra las sesiones: hay que entrar con el email
// nuevo.
const ConfirmEmailChangePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { isLoading, isSuccess, error, refetch } = useConfirmEmailChangeQuery(
    token ?? "",
    { skip: !token },
  );

  const goToLogin = () => void navigate("/login");

  if (isLoading) {
    return (
      <AuthLayout title="Confirmando tu email" subtitle="Un momento, por favor">
        <Box
          role="status"
          aria-label="Confirmando"
          sx={{ display: "flex", justifyContent: "center" }}
        >
          <CircularProgress />
        </Box>
      </AuthLayout>
    );
  }

  if (isSuccess) {
    return (
      <AuthLayout title="Email actualizado" subtitle="Entra con tu email nuevo">
        <Button fullWidth onClick={goToLogin}>
          Iniciar sesión
        </Button>
      </AuthLayout>
    );
  }

  const apiError = parseApiError(error);

  if (apiError?.code === "AUTH_EMAIL_TAKEN") {
    return (
      <AuthLayout
        title="No se pudo cambiar el email"
        subtitle="Esa dirección ya está en uso"
      >
        <Button fullWidth onClick={goToLogin}>
          Ir a Glosa
        </Button>
      </AuthLayout>
    );
  }

  // Sin token, o con un token caducado o ya usado.
  if (!token || apiError?.code === "AUTH_INVALID_TOKEN") {
    return (
      <AuthLayout
        title="Enlace no válido"
        subtitle="Este enlace ha caducado o ya se ha usado."
      >
        <Typography color="text.secondary" sx={{ mb: 5, textAlign: "center" }}>
          Si ya confirmaste el cambio, entra con tu email nuevo. Si no, puedes
          pedirlo otra vez desde Perfil.
        </Typography>
        <Button fullWidth onClick={goToLogin}>
          Ir a Glosa
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="No hemos podido confirmar tu email"
      subtitle="Ha habido un problema de conexión"
    >
      <InlineError
        message="Comprueba tu conexión e inténtalo de nuevo."
        onRetry={() => void refetch()}
      />
    </AuthLayout>
  );
};

export default ConfirmEmailChangePage;
