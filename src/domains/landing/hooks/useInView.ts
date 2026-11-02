import { useEffect, useRef, useState } from "react";

// Dice en cada momento si el elemento se ve en pantalla. `initial` es lo que
// se asume hasta la primera medición (y siempre, sin `IntersectionObserver`).
export const useInView = <T extends Element>(initial: boolean) => {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(initial);

  useEffect(() => {
    const element = ref.current;

    if (!element || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      const last = entries[entries.length - 1];

      if (last) {
        setInView(last.isIntersecting);
      }
    });
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return { ref, inView };
};
