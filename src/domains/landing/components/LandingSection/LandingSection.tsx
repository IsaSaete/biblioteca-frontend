import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import { themeVars } from "../../themeVars";

const background = (theme: Theme, tone: "surface" | "band") =>
  tone === "band"
    ? themeVars(theme).palette.landing.band
    : themeVars(theme).palette.background.paper;

interface LandingSectionProps {
  // Nota al margen: solo si aporta información.
  note?: string;
  // Fondo a todo el ancho para dar ritmo entre secciones: el normal, la
  // superficie (un tono más) o la banda oscura.
  tone?: "default" | "surface" | "band";
  children: ReactNode;
}

// Un folio de manuscrito: el texto en su columna y, al lado, el margen donde
// otra mano anota. En el código el texto va primero y la nota después, para
// que un lector de pantalla lea la sección antes que su glosa.
const LandingSection = ({
  note,
  tone = "default",
  children,
}: LandingSectionProps) => (
  <Box
    component="section"
    sx={(theme) => ({
      // El aire entre secciones se reparte arriba y abajo: así nada queda
      // pegado al borde de una superficie vecina.
      py: "clamp(32px, 4.5vw, 60px)",
      ...(tone !== "default" && {
        py: "clamp(64px, 9vw, 120px)",
        bgcolor: background(theme, tone),
        ...(tone === "band" && {
          color: themeVars(theme).palette.landing.onBand,
        }),
        // Se extiende a los lados con una sombra y se recorta en vertical:
        // así ocupa todo el ancho sin provocar scroll horizontal.
        boxShadow: `0 0 0 100vmax ${background(theme, tone)}`,
        clipPath: "inset(0 -100vmax)",
      }),
      display: "grid",
      gridTemplateColumns: "230px minmax(0, 1fr)",
      columnGap: "clamp(40px, 6vw, 76px)",
      [theme.breakpoints.down("md")]: {
        gridTemplateColumns: "minmax(0, 1fr)",
      },
    })}
  >
    <Box
      sx={(theme) => ({
        gridColumn: 2,
        gridRow: 1,
        minWidth: 0,
        [theme.breakpoints.down("md")]: { gridColumn: 1, gridRow: 2 },
      })}
    >
      {children}
    </Box>
    {note && (
      <Box
        component="aside"
        sx={(theme) => ({
          ...theme.typography.landingNote,
          gridColumn: 1,
          gridRow: 1,
          alignSelf: "start",
          fontSize: "1.3125rem",
          lineHeight: 1.3,
          color:
            tone === "band"
              ? themeVars(theme).palette.landing.bandAccent
              : themeVars(theme).palette.landing.note,
          pt: 1,
          transform: "rotate(-1.5deg)",
          transformOrigin: "left top",
          [theme.breakpoints.down("md")]: {
            transform: "none",
            mb: 5,
            pl: 3,
            py: 1,
            borderLeft: `2px solid ${themeVars(theme).palette.primary.main}`,
          },
        })}
      >
        {note}
      </Box>
    )}
  </Box>
);

export default LandingSection;
