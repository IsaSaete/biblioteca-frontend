import { useEffect, useState } from "react";

// Pasa a `true` cuando `isLoading` lleva más de `delayMs` activo. Sirve para no
// enseñar un aviso de espera larga si la respuesta llega rápido.
export const useIsSlow = (isLoading: boolean, delayMs: number): boolean => {
  const [hasWaitedLong, setHasWaitedLong] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      return undefined;
    }

    const timer = setTimeout(() => setHasWaitedLong(true), delayMs);

    return () => {
      clearTimeout(timer);
      setHasWaitedLong(false);
    };
  }, [isLoading, delayMs]);

  return isLoading && hasWaitedLong;
};
