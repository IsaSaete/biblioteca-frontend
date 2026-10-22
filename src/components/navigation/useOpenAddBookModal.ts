import { useSearchParams } from "react-router";
import {
  ADD_BOOK_MODAL,
  ADD_BOOK_SCAN_STEP,
  ADD_BOOK_STEP_PARAM,
} from "./addBookModal";

// Abre «Añadir libro» sobre la pantalla actual (`?modal=add-book`), o
// directamente en el escaneo (`&step=scan`).
export const useOpenAddBookModal = (
  step?: typeof ADD_BOOK_SCAN_STEP,
): (() => void) => {
  const [, setSearchParams] = useSearchParams();

  return () =>
    setSearchParams((params) => {
      const next = new URLSearchParams(params);
      next.set("modal", ADD_BOOK_MODAL);
      if (step) {
        next.set(ADD_BOOK_STEP_PARAM, step);
      }
      return next;
    });
};
