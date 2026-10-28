import { Link as RouterLink } from "react-router";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";

const BookmarkIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M6 3h12v18l-6-4-6 4z" />
  </svg>
);

const ChevronIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 5l7 7-7 7" />
  </svg>
);

// Acceso a la lista de deseos desde la cabecera de Biblioteca (D-036): la
// lista es aparte de la biblioteca, pero se busca donde se piensa en libros. Es
// una fila-tarjeta como las de Perfil: icono, nombre y flecha.
const WishlistLink = () => (
  <ButtonBase
    component={RouterLink}
    to="/wishlist"
    sx={{
      width: "100%",
      minHeight: 56,
      px: 4,
      gap: 3,
      mb: 4,
      justifyContent: "flex-start",
      textAlign: "left",
      bgcolor: "background.paper",
      borderRadius: 1.5,
    }}
  >
    <Box component="span" sx={{ display: "flex", color: "primary.main" }}>
      <BookmarkIcon />
    </Box>
    <Typography component="span" sx={{ flexGrow: 1 }}>
      Lista de deseos
    </Typography>
    <Box component="span" sx={{ display: "flex", color: "text.secondary" }}>
      <ChevronIcon />
    </Box>
  </ButtonBase>
);

export default WishlistLink;
