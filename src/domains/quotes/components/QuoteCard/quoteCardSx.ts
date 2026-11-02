import type { SxProps, Theme } from "@mui/material/styles";

// Superficie de la tarjeta de cita. Se comparte con la landing, que enseña la
// misma tarjeta sin ser un enlace al detalle.
export const quoteCardSx = (embedded: boolean): SxProps<Theme> => ({
  display: "flex",
  flexDirection: "column",
  // Llena la celda de la cuadrícula: así las tarjetas de una fila miden
  // lo mismo y su pie queda alineado abajo.
  height: "100%",
  p: 4,
  ...(!embedded && { bgcolor: "background.paper", borderRadius: 1.5 }),
});
