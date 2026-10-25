import { useCallback, useEffect, useState } from "react";

// Sin poder medir las tarjetas, una «página» es casi todo lo visible.
const PAGE_FRACTION = 0.9;
// Margen para los decimales de `scrollLeft` en pantallas con zoom.
const EDGE_TOLERANCE = 1;

// Una página son las tarjetas completas que caben ahora: así cada página
// empieza en una tarjeta entera. Se calcula con lo que mide el navegador (el
// paso entre dos tarjetas ya incluye el hueco).
const getPageDistance = (element: HTMLElement): number => {
  const [first, second] = Array.from(element.querySelectorAll("li"));
  const stride = second && first ? second.offsetLeft - first.offsetLeft : 0;

  if (stride <= 0) {
    return element.clientWidth * PAGE_FRACTION;
  }

  const gap = stride - first.offsetWidth;
  const visible = Math.max(
    1,
    Math.floor((element.clientWidth + gap) / stride + 0.01),
  );

  return visible * stride;
};

// Estado de desplazamiento de una fila: si queda algo por cada lado y cómo
// avanzar una página. Se recalcula al desplazar y al cambiar el tamaño. La
// referencia es un callback para enterarse de cuándo aparece la fila: las
// secciones pintan esqueletos o errores antes que el carrusel.
export const useCarouselScroll = () => {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const update = useCallback(() => {
    if (!element) {
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = element;
    setCanScrollPrev(scrollLeft > EDGE_TOLERANCE);
    setCanScrollNext(scrollLeft + clientWidth < scrollWidth - EDGE_TOLERANCE);
  }, [element]);

  // Si la fila desaparece (la sección vuelve a un esqueleto o a un error),
  // no queda nada que desplazar.
  const ref = useCallback((node: HTMLDivElement | null) => {
    setElement(node);
    if (!node) {
      setCanScrollPrev(false);
      setCanScrollNext(false);
    }
  }, []);

  // `ResizeObserver` calcula también al empezar a observar, así que no hace
  // falta una medición aparte al montar.
  useEffect(() => {
    if (!element || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(update);
    observer.observe(element);
    if (element.firstElementChild) {
      observer.observe(element.firstElementChild);
    }

    return () => observer.disconnect();
  }, [element, update]);

  const scrollPage = (direction: -1 | 1) => {
    if (!element) {
      return;
    }

    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    element.scrollBy({
      left: direction * getPageDistance(element),
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  return {
    ref,
    canScrollPrev,
    canScrollNext,
    onScroll: update,
    scrollPage,
  };
};

export type CarouselScroll = ReturnType<typeof useCarouselScroll>;
