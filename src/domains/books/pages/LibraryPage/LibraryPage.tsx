import { Link as RouterLink } from "react-router";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

// Provisional: estado vacío de la biblioteca (HU-14) sin la acción «Añadir tu
// primer libro» hasta que exista el alta de libros (HU-15). El enlace a Perfil
// se sustituye por la barra de navegación inferior.
const LibraryPage = () => (
  <Box
    component="main"
    sx={{ maxWidth: 480, mx: "auto", px: 4, py: 8, textAlign: "center" }}
  >
    <Typography variant="h6" component="h1">
      Tu estantería está vacía, de momento
    </Typography>
    <Box sx={{ mt: 6 }}>
      <Link component={RouterLink} to="/profile">
        Perfil
      </Link>
    </Box>
  </Box>
);

export default LibraryPage;
