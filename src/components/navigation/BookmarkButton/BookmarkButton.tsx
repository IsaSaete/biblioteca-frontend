import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import { useOpenAddBookModal } from "../useOpenAddBookModal";

interface BookmarkButtonProps {
  // En la barra inferior sobresale un poco por encima de ella; en el rail
  // lateral va alineado con el resto, arriba.
  placement: "bottom" | "side";
}

const Bookmark = ({ height }: { height: number }) => (
  <svg height={height} viewBox="0 0 38 50" aria-hidden="true" focusable="false">
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
);

// Distancia entre el borde inferior de la casilla de la etiqueta y la base de
// sus letras (con la fuente de 11px y su interlineado de 1,3, unos 3px).
const LABEL_BASELINE_OFFSET = 3;

// Alto del marcapáginas en la barra inferior: con la punta en la base de las
// letras, sobresale unos 7px por encima de la barra.
const BOTTOM_HEIGHT = 53;

// El botón central con forma de marcapáginas: siempre significa «añadir libro».
// Abre el flujo como modal sobre la pantalla actual (`?modal=add-book`).
// Forma del wireframe: esquinas redondeadas arriba y pico redondeado abajo.
//
// En la barra inferior comparte la estructura de los demás botones (casilla de
// icono de 24px y casilla de etiqueta): el marcapáginas se apoya en la base de
// las letras de las etiquetas y crece hacia arriba, así su punta queda a la
// misma altura que ellas y solo sobresale de la barra por arriba.
const BookmarkButton = ({ placement }: BookmarkButtonProps) => {
  const openAddBook = useOpenAddBookModal();

  if (placement === "side") {
    return (
      <ButtonBase
        aria-label="Añadir libro"
        onClick={openAddBook}
        sx={{
          minWidth: 44,
          minHeight: 44,
          px: 3,
          color: "primary.contrastText",
          alignSelf: "center",
          mb: 2,
        }}
      >
        <Bookmark height={50} />
      </ButtonBase>
    );
  }

  return (
    <ButtonBase
      aria-label="Añadir libro"
      onClick={openAddBook}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        minWidth: 44,
        minHeight: 56,
        px: 3,
        py: 2,
        color: "primary.contrastText",
      }}
    >
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
        }}
      >
        {/* Casillas vacías del icono y de la etiqueta: mantienen la altura y la
            posición de los demás botones. */}
        <Box sx={{ width: 24, height: 24 }} />
        <Typography
          aria-hidden="true"
          component="span"
          sx={{ fontSize: "0.6875rem", lineHeight: 1.3, fontWeight: 500 }}
        >
          &nbsp;
        </Typography>
        <Box
          sx={{
            position: "absolute",
            bottom: LABEL_BASELINE_OFFSET,
            display: "flex",
          }}
        >
          <Bookmark height={BOTTOM_HEIGHT} />
        </Box>
      </Box>
    </ButtonBase>
  );
};

export default BookmarkButton;
