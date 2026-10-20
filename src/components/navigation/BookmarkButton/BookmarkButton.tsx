import ButtonBase from "@mui/material/ButtonBase";
import { useOpenAddBookModal } from "../useOpenAddBookModal";

interface BookmarkButtonProps {
  // En la barra inferior sobresale por encima de ella; en el rail lateral va
  // alineado con el resto, arriba.
  placement: "bottom" | "side";
}

// El botón central con forma de marcapáginas: siempre significa «añadir libro».
// Abre el flujo como modal sobre la pantalla actual (`?modal=add-book`).
// Forma del wireframe: esquinas redondeadas arriba y pico redondeado abajo.
const BookmarkButton = ({ placement }: BookmarkButtonProps) => {
  const openAddBook = useOpenAddBookModal();

  return (
    <ButtonBase
      aria-label="Añadir libro"
      onClick={openAddBook}
      sx={{
        minWidth: 44,
        minHeight: 44,
        px: 3,
        color: "primary.contrastText",
        ...(placement === "bottom"
          ? { alignSelf: "flex-start", mt: -3.5 }
          : { alignSelf: "center", mb: 2 }),
      }}
    >
      <svg
        width="38"
        height="50"
        viewBox="0 0 38 50"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M6 0H32Q38 0 38 6V30Q38 34 35 37L22 48Q19 51 16 48L3 37Q0 34 0 30V6Q0 0 6 0Z"
          fill="var(--mui-palette-primary-main)"
        />
        <path
          d="M19 11v12M13 17h12"
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
