import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import {
  ARROWS_OUTSIDE_MIN_WIDTH,
  getArrowTop,
  getCarouselItemStyles,
  mouseQuery,
} from "./carouselStyles";
import type { CarouselItemWidth, ItemsPerPage } from "./carouselStyles";
import { useCarouselScroll } from "./useCarouselScroll";

interface HorizontalCarouselProps {
  // Nombre de la región para lectores de pantalla («Añadidos recientemente»).
  label: string;
  // Ancho de cada elemento con dedo; puede ser responsive. La siguiente
  // tarjeta asoma para intuir que hay más a la derecha.
  itemWidth: CarouselItemWidth;
  // Con ratón, cuántos elementos completos caben por página (en ventana de
  // tablet y de escritorio).
  itemsPerPage: ItemsPerPage;
  // Alto / ancho de la imagen de cada elemento (1,5 en portadas): las flechas
  // se centran en la imagen. Sin él, en el centro de la tarjeta.
  mediaRatio?: number;
  // Elementos de lista (`<li>`).
  children: ReactNode;
}

const ARROW_SIZE = 36;
const ARROW_GAP = 8;

interface ArrowProps {
  side: "left" | "right";
  label: string;
  itemsPerPage: ItemsPerPage;
  mediaRatio?: number;
  onClick: () => void;
}

// Flecha lateral, solo para quien usa ratón; siempre a la vista mientras haya
// más por ese lado. En ventana ancha queda fuera de la fila, en el margen de la
// página, así que no tapa ninguna portada; en una más estrecha se apoya sobre el
// borde de la fila.
const Arrow = ({
  side,
  label,
  itemsPerPage,
  mediaRatio,
  onClick,
}: ArrowProps) => (
  <IconButton
    aria-label={label}
    onClick={onClick}
    sx={(theme) => ({
      display: "none",
      position: "absolute",
      transform: "translateY(-50%)",
      [side]: ARROW_GAP,
      width: ARROW_SIZE,
      height: ARROW_SIZE,
      bgcolor: "background.paper",
      color: "text.primary",
      boxShadow: 1,
      ...getArrowTop(theme, itemsPerPage, mediaRatio),
      [mouseQuery(theme)]: { display: "flex" },
      [`@media (hover: hover) and (pointer: fine) and (min-width:${ARROWS_OUTSIDE_MIN_WIDTH}px)`]:
        { [side]: -(ARROW_SIZE + ARROW_GAP) },
      // Neutra en reposo; el color de acción solo al señalarla o enfocarla.
      "&:hover, &.Mui-focusVisible": {
        bgcolor: "primary.main",
        color: "primary.contrastText",
      },
    })}
  >
    <svg
      width="20"
      height="20"
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
);

// Fila de scroll horizontal con `scroll-snap`, sin autoavance ni barra de
// scroll. Con dedo se desliza y la siguiente tarjeta asoma, sangrando hasta el
// borde de la pantalla (compensa el padding de la página). Con ratón, desde
// tablet, mide lo mismo que el contenido de la página, caben N elementos
// completos y las flechas laterales pasan de página; con teclado, la región es
// enfocable para desplazarla con las flechas.
const HorizontalCarousel = ({
  label,
  itemWidth,
  itemsPerPage,
  mediaRatio,
  children,
}: HorizontalCarouselProps) => {
  const { ref, canScrollPrev, canScrollNext, onScroll, scrollPage } =
    useCarouselScroll();

  return (
    <Box
      sx={(theme) => ({
        position: "relative",
        // Para medir en `cqw` el ancho del carrusel (posición de las flechas).
        containerType: "inline-size",
        mx: -4,
        [mouseQuery(theme, "sm")]: { mx: 0 },
      })}
    >
      <Box
        ref={ref}
        role="region"
        aria-label={label}
        tabIndex={0}
        onScroll={onScroll}
        sx={(theme) => ({
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          // Igual que el `px` de la fila: MUI no convierte este valor al
          // espaciado del tema, así que se pide explícitamente. Con menos, el
          // snap deja la primera tarjeta desplazada y aparece la flecha izquierda.
          scrollPaddingInline: theme.spacing(4),
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
          px: 4,
          // Aire arriba y abajo para que la sombra de las portadas no se corte
          // (un contenedor con scroll recorta también en vertical); los márgenes
          // negativos devuelven el contenido a su sitio.
          pt: 2,
          pb: 3,
          mt: -2,
          mb: -1,
          [mouseQuery(theme, "sm")]: { px: 0, scrollPaddingInline: 0 },
        })}
      >
        <Box
          component="ul"
          sx={(theme) => ({
            display: "flex",
            gap: 3,
            m: 0,
            p: 0,
            listStyle: "none",
            "& > li": {
              ...getCarouselItemStyles(theme, itemWidth, itemsPerPage),
              scrollSnapAlign: "start",
            },
          })}
        >
          {children}
        </Box>
      </Box>
      {canScrollPrev && (
        <Arrow
          side="left"
          label="Ver anteriores"
          itemsPerPage={itemsPerPage}
          mediaRatio={mediaRatio}
          onClick={() => scrollPage(-1)}
        />
      )}
      {canScrollNext && (
        <Arrow
          side="right"
          label="Ver siguientes"
          itemsPerPage={itemsPerPage}
          mediaRatio={mediaRatio}
          onClick={() => scrollPage(1)}
        />
      )}
    </Box>
  );
};

export default HorizontalCarousel;
