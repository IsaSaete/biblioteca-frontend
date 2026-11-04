import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import { authApi, useMeQuery } from "../../auth/authApi";

// La landing se pinta al instante y no espera al backend (Render se duerme).
// La sesión se comprueba en segundo plano y, solo si existe, se pasa a Inicio.
// Mientras carga, o si la comprobación falla o tarda, la landing sigue ahí.
export const useRedirectWhenSignedIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { data } = useMeQuery();
  // Tras cerrar sesión la caché aún guarda la sesión un instante: no cuenta.
  const hasJustSignedOut =
    typeof location.state === "object" &&
    location.state !== null &&
    "signedOut" in location.state;
  const isSignedIn = data !== undefined && !hasJustSignedOut;

  useEffect(() => {
    if (hasJustSignedOut) {
      dispatch(authApi.util.resetApiState());
    }
  }, [hasJustSignedOut, dispatch]);

  useEffect(() => {
    if (isSignedIn) {
      void navigate("/home", { replace: true });
    }
  }, [isSignedIn, navigate]);
};
