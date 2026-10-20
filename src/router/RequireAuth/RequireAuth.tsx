import { Navigate, Outlet, useLocation } from "react-router";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import InlineError from "../../components/ui/InlineError/InlineError";
import { useMeQuery } from "../../domains/auth/authApi";

const isUnauthenticated = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "status" in error &&
  error.status === 401;

// Protege las rutas que requieren sesión. La caché de `useMeQuery` es la única
// fuente de verdad de si hay sesión (arquitectura-tecnica.md).
const RequireAuth = () => {
  const location = useLocation();
  const { data, isLoading, isError, error, refetch } = useMeQuery();

  if (isLoading) {
    return (
      <Box
        role="status"
        aria-label="Cargando"
        sx={{ display: "grid", gap: 4, p: 4 }}
      >
        <Skeleton variant="text" width="60%" height={32} />
        <Skeleton variant="rounded" height={120} />
        <Skeleton variant="rounded" height={120} />
      </Box>
    );
  }

  if (isError && isUnauthenticated(error)) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  if (isError) {
    return (
      <InlineError
        message="No hemos podido comprobar tu sesión."
        onRetry={() => void refetch()}
      />
    );
  }

  // Solo `false` redirige: si el backend aún no devuelve el campo, no se fuerza.
  if (
    data?.user.onboardingCompleted === false &&
    location.pathname !== "/onboarding"
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
