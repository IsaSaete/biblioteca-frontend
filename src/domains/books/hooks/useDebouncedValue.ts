import { useEffect, useState } from "react";

// Devuelve `value` con retraso: solo cambia cuando deja de cambiar durante
// `delayMs`. Para no lanzar una petición por cada tecla.
export const useDebouncedValue = <T>(value: T, delayMs: number): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
};
