import ButtonBase from "@mui/material/ButtonBase";
import { useSearchParams } from "react-router";
import { ADD_BOOK_MODAL } from "../addBookModal";

// El botón central con forma de marcapáginas: siempre significa «añadir libro».
// Abre el flujo como modal sobre la pantalla actual (`?modal=add-book`).
const BookmarkButton = () => {
  const [, setSearchParams] = useSearchParams();

  return (
    <ButtonBase
      aria-label="Añadir libro"
      onClick={() =>
        setSearchParams((params) => {
          const next = new URLSearchParams(params);
          next.set("modal", ADD_BOOK_MODAL);
          return next;
        })
      }
      sx={{ minWidth: 44, minHeight: 56, px: 3, color: "primary.contrastText" }}
    >
      <svg
        width="36"
        height="46"
        viewBox="0 0 36 46"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M4 0h28a4 4 0 0 1 4 4v38l-18-9-18 9V4a4 4 0 0 1 4-4z"
          fill="var(--mui-palette-primary-main)"
        />
        <path
          d="M18 11v12M12 17h12"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </ButtonBase>
  );
};

export default BookmarkButton;
