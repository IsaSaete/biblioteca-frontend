import { useCallback, useEffect, useRef, useState } from "react";

// Una «página» de desplazamiento: casi todo lo visible, para que la última
// tarjeta de una página siga asomando en la siguiente.
const PAGE_FRACTION = 0.9;
// Margen para los decimales de `scrollLeft` en pantallas con zoom.
const EDGE_TOLERANCE = 1;

// Estado de desplazamiento de una fila: si queda algo por cada lado y cómo
// avanzar una página. Se recalcula al desplazar y al cambiar el tamaño.
export const useCarouselScroll = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const update = useCallback(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = element;
    setCanScrollPrev(scrollLeft > EDGE_TOLERANCE);
    setCanScrollNext(scrollLeft + clientWidth < scrollWidth - EDGE_TOLERANCE);
  }, []);

  useEffect(() => {
    update();

    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(update);
    observer.observe(element);
    if (element.firstElementChild) {
      observer.observe(element.firstElementChild);
    }

    return () => observer.disconnect();
  }, [update]);

  const scrollPage = (direction: -1 | 1) => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    element.scrollBy({
      left: direction * element.clientWidth * PAGE_FRACTION,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  return { ref, canScrollPrev, canScrollNext, onScroll: update, scrollPage };
};
