import { useEffect, useState } from "react";

// Ref callback que avisa cuando el elemento entra en pantalla (con 200px de
// margen, para pedir lo siguiente antes de llegar al final). Sin
// IntersectionObserver no hace nada.
export const useOnVisible = (onVisible: () => void) => {
  const [node, setNode] = useState<Element | null>(null);

  useEffect(() => {
    if (!node || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          onVisible();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);

    return () => observer.disconnect();
  }, [node, onVisible]);

  return setNode;
};
