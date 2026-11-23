import { useEffect } from "react";

const WAKE_KEY = "serverWakeRequested";

const hasAlreadyWoken = (): boolean => {
  try {
    return sessionStorage.getItem(WAKE_KEY) !== null;
  } catch {
    return false;
  }
};

const rememberWake = (): void => {
  try {
    sessionStorage.setItem(WAKE_KEY, "1");
  } catch {
    // Sin almacenamiento (ventana privada): se pedirá de nuevo, sin más.
  }
};

// Render duerme el backend si nadie lo usa. Al llegar a la landing se le da un
// toque para que, cuando la persona entre a su cuenta, ya esté despierto. Es un
// respaldo del ping periódico externo: no espera la respuesta, ignora los
// errores y se hace una sola vez por sesión del navegador.
export const useWakeServer = () => {
  useEffect(() => {
    if (hasAlreadyWoken()) {
      return;
    }

    rememberWake();
    fetch(`${import.meta.env.VITE_API_URL || "/api"}/`).catch(() => undefined);
  }, []);
};
