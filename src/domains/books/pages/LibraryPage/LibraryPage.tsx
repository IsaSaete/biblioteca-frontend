import Box from "@mui/material/Box";
import EmptyState from "../../../../components/ui/EmptyState/EmptyState";
import { LibraryIcon } from "../../../../components/navigation/NavIcons";

const visuallyHidden = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
} as const;

// Estado vacío de la biblioteca (HU-14). La acción «Añadir tu primer libro» se
// incorpora cuando exista el alta de libros (HU-15): no se muestra una
// función que todavía no está implementada.
const LibraryPage = () => (
  <Box component="main" sx={{ maxWidth: 720, mx: "auto" }}>
    <Box component="h1" sx={visuallyHidden}>
      Biblioteca
    </Box>
    <EmptyState
      icon={<LibraryIcon />}
      title="Tu estantería está vacía, de momento"
    />
  </Box>
);

export default LibraryPage;
