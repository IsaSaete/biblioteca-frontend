import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { useCarouselScroll } from "./useCarouselScroll";

export type CarouselItemWidth =
  string | number | Partial<Record<"xs" | "sm" | "md", string | number>>;

interface HorizontalCarouselProps {
  // Nombre de la región para lectores de pantalla («Añadidos recientemente»).
  label: string;
  // Ancho de cada elemento; puede ser responsive. Con la siguiente tarjeta
  // asomando se intuye que hay más a la derecha.
  itemWidth: CarouselItemWidth;
  // Elementos de lista (`<li>`).
  children: ReactNode;
}

const ARROW_FADE_WIDTH = 72;

interface ArrowProps {
  side: "left" | "right";
  label: string;
  onClick: () => void;
}

// Flecha lateral sobre un degradado del color de fondo, para que se lea sobre
// las portadas. Solo la ve quien usa ratón (ver el carrusel).
const Arrow = ({ side, label, onClick }: ArrowProps) => (
  <Box
    className="carousel-arrow"
    sx={{
      position: "absolute",
      top: 0,
      bottom: 8,
      [side]: 0,
      width: ARROW_FADE_WIDTH,
      alignItems: "center",
      justifyContent: side === "left" ? "flex-start" : "flex-end",
      px: 2,
      pointerEvents: "none",
      background: `linear-gradient(to ${side === "left" ? "right" : "left"}, var(--mui-palette-background-default), transparent)`,
    }}
  >
    <IconButton
      aria-label={label}
      onClick={onClick}
      sx={{
        pointerEvents: "auto",
        bgcolor: "background.paper",
        color: "text.primary",
        boxShadow: 2,
        // Neutra en reposo; el color de acción solo al señalarla o enfocarla.
        "&:hover, &.Mui-focusVisible": {
          bgcolor: "primary.main",
          color: "primary.contrastText",
        },
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={side === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
      </svg>
    </IconButton>
  </Box>
);

// Fila de scroll horizontal con `scroll-snap`, sin autoavance ni barra de
// scroll. Con dedo se desliza; con ratón aparecen flechas laterales al pasar
// por encima, y con teclado la región es enfocable para desplazarla con las
// flechas. En móvil sangra hasta el borde de la pantalla (compensa el padding
// de la página).
const HorizontalCarousel = ({
  label,
  itemWidth,
  children,
}: HorizontalCarouselProps) => {
  const { ref, canScrollPrev, canScrollNext, onScroll, scrollPage } =
    useCarouselScroll();

  return (
    <Box
      sx={{
        position: "relative",
        mx: -4,
        "& .carousel-arrow": { display: "none" },
        "@media (hover: hover) and (pointer: fine)": {
          "& .carousel-arrow": {
            display: "flex",
            opacity: 0,
            transition: "opacity 150ms",
          },
          "&:hover .carousel-arrow, &:focus-within .carousel-arrow": {
            opacity: 1,
          },
        },
      }}
    >
      <Box
        ref={ref}
        role="region"
        aria-label={label}
        tabIndex={0}
        onScroll={onScroll}
        sx={{
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollPaddingInline: 4,
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
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
      {canScrollPrev && (
        <Arrow
          side="left"
          label="Ver anteriores"
          onClick={() => scrollPage(-1)}
        />
      )}
      {canScrollNext && (
        <Arrow
          side="right"
          label="Ver siguientes"
          onClick={() => scrollPage(1)}
        />
      )}
    </Box>
  );
};

export default HorizontalCarousel;
