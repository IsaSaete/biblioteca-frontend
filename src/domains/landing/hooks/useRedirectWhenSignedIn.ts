import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import { readCookie } from "../../../utils/readCookie";
import { authApi, useMeQuery } from "../../auth/authApi";

// La landing se pinta al instante y no espera al backend (Render se duerme).
// La sesión se comprueba en segundo plano y, solo si existe, se pasa a Inicio.
// Mientras carga, o si la comprobación falla o tarda, la landing sigue ahí.
//
// Sin la cookie `csrfToken` no puede haber sesión (se crea al iniciar sesión,
// dura lo mismo que ella y se borra al cerrarla), así que a quien llega sin
// ella no se le pregunta: sin petición, sin el 401 en rojo de la consola y sin
// repetirla cada vez que se abre el diálogo de entrar.
export const useRedirectWhenSignedIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const hasSessionHint = readCookie("csrfToken") !== undefined;
  const { data } = useMeQuery(undefined, { skip: !hasSessionHint });
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
