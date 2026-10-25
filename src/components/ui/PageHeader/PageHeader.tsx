import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface PageHeaderProps {
  title: string;
  // Recuento o contexto bajo el título («34 citas · 12 libros»).
  meta?: string;
  // La acción principal de la pantalla, si tiene: la única con color.
  action?: ReactNode;
}

// Cabecera de las pantallas de lista (Biblioteca y Citas): título, un recuento
// discreto y, a la derecha, la acción principal.
const PageHeader = ({ title, meta, action }: PageHeaderProps) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 4,
      mb: 4,
    }}
  >
    <Box sx={{ minWidth: 0 }}>
      <Typography
        component="h1"
        sx={{ fontSize: "1.1875rem", fontWeight: 500, lineHeight: 1.3 }}
      >
        {title}
      </Typography>
      {meta && (
        <Typography
          color="text.secondary"
          sx={{ fontSize: "0.75rem", lineHeight: 1.5 }}
        >
          {meta}
        </Typography>
      )}
    </Box>
    {action}
  </Box>
);

export default PageHeader;
