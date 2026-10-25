import type { ReactNode } from "react";
import Box from "@mui/material/Box";

interface ListToolbarProps {
  // A la izquierda, el filtro; a la derecha, el orden.
  start: ReactNode;
  end: ReactNode;
}

// Barra de herramientas de las pantallas de lista: filtro a la izquierda y
// orden a la derecha, entre dos líneas finas. Los controles son texto, así que
// el color queda para la acción principal de la cabecera. Los botones llevan
// un margen interior de 8px que se compensa aquí para que su texto alinee con
// el borde del contenido.
const ListToolbar = ({ start, end }: ListToolbarProps) => (
  <Box
    sx={{
      mb: 4,
      borderTop: 1,
      borderBottom: 1,
      borderColor: "secondary.main",
    }}
  >
    <Box
      sx={{
        mx: -2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 3,
      }}
    >
      {start}
      {end}
    </Box>
  </Box>
);

export default ListToolbar;
