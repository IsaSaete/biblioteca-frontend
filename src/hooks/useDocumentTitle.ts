import { useEffect } from "react";

const SITE_NAME = "Glosa";

// Pone el título de la pestaña («Biblioteca — Glosa») mientras la pantalla está
// montada y devuelve el anterior al salir. Sin título (p. ej. mientras carga el
// libro) no cambia nada. Cada pantalla debe tener el suyo: es lo primero que
// anuncia un lector de pantalla al cambiar de página (WCAG 2.4.2).
export const useDocumentTitle = (title: string | undefined) => {
  useEffect(() => {
    if (!title) {
      return;
    }

    const previousTitle = document.title;
    document.title = `${title} — ${SITE_NAME}`;

    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};
