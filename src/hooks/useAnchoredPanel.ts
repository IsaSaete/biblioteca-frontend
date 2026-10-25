import { useState } from "react";
import type { MouseEvent } from "react";

// Estado de un panel que se abre desde un botón: si está abierto y cuál es el
// botón (para anclar el panel debajo en tablet y escritorio). El botón se
// conserva al cerrar, para que el panel no salte de sitio mientras se cierra.
export const useAnchoredPanel = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const open = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  return { isOpen, anchorEl, open, close };
};
