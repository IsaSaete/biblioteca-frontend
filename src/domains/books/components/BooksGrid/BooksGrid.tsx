import type { ReactNode } from "react";
import Box from "@mui/material/Box";

interface BooksGridProps {
  children: ReactNode;
  // Rejilla de esqueletos mientras carga: no es la lista real de libros.
  isPlaceholder?: boolean;
}

// 3 columnas en móvil; desde tablet, las que quepan con ≥140px por portada
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
        sm: "repeat(auto-fill, minmax(140px, 1fr))",
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
