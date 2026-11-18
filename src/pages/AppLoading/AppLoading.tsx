import Box from "@mui/material/Box";
import Logo from "../../components/ui/Logo/Logo";

// Lo que se ve mientras el enrutado descarga la primera pantalla (por ejemplo,
// un enlace directo a una pantalla que se descarga al visitarla): la marca, en
// lugar de una página en blanco. Es la `HydrateFallback` de la ruta raíz.
const AppLoading = () => (
  <Box
    role="status"
    aria-label="Cargando"
    sx={{ minHeight: "100vh", px: 4, py: 8 }}
  >
    <Logo />
  </Box>
);

export default AppLoading;
