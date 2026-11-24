// Cada nivel ocupa siempre una línea de esta altura, con puntos suspensivos si
// el texto es más largo: así el pie de todas las tarjetas mide lo mismo, tenga
// el libro el autor o el título que tenga.
export const referenceLineSx = {
  minHeight: "1.5em",
  lineHeight: 1.5,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
} as const;
