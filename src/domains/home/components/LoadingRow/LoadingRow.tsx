import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import type { CarouselItemWidth } from "../../../../components/ui/HorizontalCarousel/HorizontalCarousel";

interface LoadingRowProps {
  itemWidth: CarouselItemWidth;
  children: ReactNode;
}

// Fila de esqueletos con las medidas del carrusel, sin ser enfocable ni región
// mientras no hay nada que desplazar.
const LoadingRow = ({ itemWidth, children }: LoadingRowProps) => (
  <Box
    component="ul"
    sx={{
      display: "flex",
      gap: 3,
      m: 0,
      p: 0,
      overflow: "hidden",
      listStyle: "none",
      "& > li": { flex: "none", width: itemWidth },
    }}
  >
    {children}
  </Box>
);

export default LoadingRow;
