import type { Theme } from "@mui/material/styles";

export type CarouselItemWidth =
  string | number | Partial<Record<"xs" | "sm" | "md", string | number>>;

// Cuántos elementos caben, completos, en cada «página» del carrusel con ratón.
export interface ItemsPerPage {
  sm: number;
  md: number;
}

// Ratón (no táctil) y ventana de tablet o más: ahí el carrusel se alinea con
// el contenido de la página y pasa de página en página, sin elementos
// cortados. En táctil se queda el asomo del siguiente elemento, que invita a
// deslizar con el dedo.
export const mouseQuery = (theme: Theme, minWidthKey?: "sm" | "md"): string => {
  const base = "(hover: hover) and (pointer: fine)";

  return minWidthKey
    ? `@media ${base} and (min-width:${theme.breakpoints.values[minWidthKey]}px)`
    : `@media ${base}`;
};

const getExactWidth = (theme: Theme, count: number): string =>
  `calc((100% - ${count - 1} * ${theme.spacing(3)}) / ${count})`;

// Estilos de cada `<li>` del carrusel (y de su esqueleto de carga, para que no
// salte al cargar).
export const getCarouselItemStyles = (
  theme: Theme,
  itemWidth: CarouselItemWidth,
  itemsPerPage: ItemsPerPage,
) => ({
  flex: "none",
  width: itemWidth,
  [mouseQuery(theme, "sm")]: { width: getExactWidth(theme, itemsPerPage.sm) },
  [mouseQuery(theme, "md")]: { width: getExactWidth(theme, itemsPerPage.md) },
});

// Altura a la que centrar las flechas. Con `mediaRatio` (alto / ancho de la
// imagen, 1,5 en portadas) se centran en la imagen y no en toda la tarjeta, que
// en los libros incluye el título. Se calcula con el ancho del carrusel
// (`cqw`, unidades de contenedor) porque `top` en % mide el alto, no el ancho.
export const getArrowTop = (
  theme: Theme,
  itemsPerPage: ItemsPerPage,
  mediaRatio?: number,
) => {
  if (!mediaRatio) {
    return { top: "50%" };
  }

  const getTop = (count: number) =>
    `calc((100cqw - ${count - 1} * ${theme.spacing(3)}) / ${count} * ${mediaRatio / 2})`;

  return {
    top: "50%",
    [mouseQuery(theme, "sm")]: { top: getTop(itemsPerPage.sm) },
    [mouseQuery(theme, "md")]: { top: getTop(itemsPerPage.md) },
  };
};

// Ancho de ventana (con ratón) a partir del cual hay sitio a los lados del
// contenido para las flechas; con menos, se ponen sobre el borde de la fila.
export const ARROWS_OUTSIDE_MIN_WIDTH = 1100;
