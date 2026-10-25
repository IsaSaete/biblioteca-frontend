import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import { getCarouselItemStyles } from "../../../../components/ui/HorizontalCarousel/carouselStyles";
import type {
  CarouselItemWidth,
  ItemsPerPage,
} from "../../../../components/ui/HorizontalCarousel/carouselStyles";

interface LoadingRowProps {
  itemWidth: CarouselItemWidth;
  itemsPerPage: ItemsPerPage;
  children: ReactNode;
}

// Fila de esqueletos con las medidas del carrusel, sin ser enfocable ni región
// mientras no hay nada que desplazar.
const LoadingRow = ({ itemWidth, itemsPerPage, children }: LoadingRowProps) => (
  <Box
    component="ul"
    sx={(theme) => ({
      display: "flex",
      gap: 3,
      m: 0,
      p: 0,
      overflow: "hidden",
      listStyle: "none",
      "& > li": getCarouselItemStyles(theme, itemWidth, itemsPerPage),
    })}
  >
    {children}
  </Box>
);

export default LoadingRow;
