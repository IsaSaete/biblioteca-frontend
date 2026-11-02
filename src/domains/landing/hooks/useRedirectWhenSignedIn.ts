import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useMeQuery } from "../../auth/authApi";

// La landing se pinta al instante y no espera al backend (Render se duerme).
// La sesión se comprueba en segundo plano y, solo si existe, se pasa a Inicio.
// Mientras carga, o si la comprobación falla o tarda, la landing sigue ahí.
export const useRedirectWhenSignedIn = () => {
  const navigate = useNavigate();
  const { data } = useMeQuery();
  const isSignedIn = data !== undefined;

  useEffect(() => {
    if (isSignedIn) {
      void navigate("/home", { replace: true });
    }
  }, [isSignedIn, navigate]);
};
