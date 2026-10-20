import { useSearchParams } from "react-router";
import { ADD_BOOK_MODAL } from "./addBookModal";

// Abre «Añadir libro» sobre la pantalla actual (`?modal=add-book`).
export const useOpenAddBookModal = (): (() => void) => {
  const [, setSearchParams] = useSearchParams();

  return () =>
    setSearchParams((params) => {
      const next = new URLSearchParams(params);
      next.set("modal", ADD_BOOK_MODAL);
      return next;
    });
};
