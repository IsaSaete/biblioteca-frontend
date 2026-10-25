import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import type { BoxProps } from "@mui/material/Box";

interface HorizontalCarouselProps {
  // Nombre de la región para lectores de pantalla («Añadidos recientemente»).
  label: string;
  // Ancho de cada elemento; puede ser responsive. Con la siguiente tarjeta
  // asomando se intuye que hay más a la derecha.
  itemWidth: BoxProps["width"];
  // Elementos de lista (`<li>`).
  children: ReactNode;
}

// Fila de scroll horizontal con `scroll-snap`, sin autoavance. La región es
// enfocable para poder desplazarla con las flechas del teclado. En móvil
// sangra hasta el borde de la pantalla (compensa el padding de la página).
const HorizontalCarousel = ({
  label,
  itemWidth,
  children,
}: HorizontalCarouselProps) => (
  <Box
    role="region"
    aria-label={label}
    tabIndex={0}
    sx={{
      overflowX: "auto",
      scrollSnapType: "x mandatory",
      scrollPaddingInline: 4,
      scrollbarWidth: "thin",
      mx: -4,
      px: 4,
      pb: 2,
    }}
  >
    <Box
      component="ul"
      sx={{
        display: "flex",
        gap: 3,
        m: 0,
        p: 0,
        listStyle: "none",
        "& > li": {
          flex: "none",
          width: itemWidth,
          scrollSnapAlign: "start",
        },
      }}
    >
      {children}
    </Box>
  </Box>
);

export default HorizontalCarousel;
