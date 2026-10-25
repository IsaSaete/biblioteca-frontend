import type { ReactNode } from "react";
import Box from "@mui/material/Box";

interface BooksGridProps {
  children: ReactNode;
  // Rejilla de esqueletos mientras carga: no es la lista real de libros.
  isPlaceholder?: boolean;
}

// 3 columnas en móvil, 4 en tablet y 5 en escritorio (como las páginas del
// carrusel de Inicio): portadas de unos 173px en escritorio
// (pantallas-y-flujos.md, «Biblioteca — doble vista»).
const BooksGrid = ({ children, isPlaceholder = false }: BooksGridProps) => (
  <Box
    component="ul"
    aria-label={isPlaceholder ? undefined : "Tus libros"}
    aria-hidden={isPlaceholder || undefined}
    sx={{
      display: "grid",
      gridTemplateColumns: {
        xs: "repeat(3, minmax(0, 1fr))",
        sm: "repeat(4, minmax(0, 1fr))",
        md: "repeat(5, minmax(0, 1fr))",
      },
      gap: 4,
      m: 0,
      p: 0,
    }}
  >
    {children}
  </Box>
);

export default BooksGrid;
