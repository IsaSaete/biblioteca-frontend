import type { ReactNode } from "react";
import Box from "@mui/material/Box";

interface BooksListProps {
  children: ReactNode;
  // Filas de esqueleto mientras carga: no es la lista real de libros.
  isPlaceholder?: boolean;
}

// Vista lista de la Biblioteca (HU-10): una columna en móvil y dos desde
// tablet, para no dejar un mar de espacio vacío en filas anchas.
const BooksList = ({ children, isPlaceholder = false }: BooksListProps) => (
  <Box
    component="ul"
    aria-label={isPlaceholder ? undefined : "Tus libros"}
    aria-hidden={isPlaceholder || undefined}
    sx={{
      display: "grid",
      gridTemplateColumns: {
        xs: "minmax(0, 1fr)",
        sm: "repeat(2, minmax(0, 1fr))",
      },
      columnGap: 8,
      m: 0,
      p: 0,
    }}
  >
    {children}
  </Box>
);

export default BooksList;
