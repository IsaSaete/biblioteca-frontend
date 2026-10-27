import { Navigate, Outlet, useLocation } from "react-router";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import InlineError from "../../components/ui/InlineError/InlineError";
import SlowLoadNotice from "../../components/ui/SlowLoadNotice/SlowLoadNotice";
import { useMeQuery } from "../../domains/auth/authApi";
import { useIsSlow } from "../../hooks/useIsSlow";

// Pasado este tiempo, la espera deja de ser normal y se explica (arranque en
// frío del servidor).
const SLOW_LOAD_MS = 1000;

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

  const isSlow = useIsSlow(isLoading, SLOW_LOAD_MS);

  if (isLoading) {
    if (isSlow) {
      return <SlowLoadNotice />;
    }

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
