import { useEffect, useRef, useState } from "react";

// Avisa una sola vez de que el elemento ha entrado en pantalla y deja de
// observarlo. Sin `IntersectionObserver` (navegadores muy antiguos) se da por
// visto, para que el contenido nunca se quede a medias.
export const useOnceInView = <T extends Element>(threshold = 0.4) => {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(() => !("IntersectionObserver" in window));

  useEffect(() => {
    const element = ref.current;

    if (!element || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, seen };
};
