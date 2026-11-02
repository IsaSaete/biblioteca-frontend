import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import { themeVars } from "../../themeVars";

interface LandingSectionProps {
  // Nota al margen: solo si aporta información.
  note?: string;
  children: ReactNode;
}

// Un folio de manuscrito: el texto en su columna y, al lado, el margen donde
// otra mano anota. En el código el texto va primero y la nota después, para
// que un lector de pantalla lea la sección antes que su glosa.
const LandingSection = ({ note, children }: LandingSectionProps) => (
  <Box
    component="section"
    sx={(theme) => ({
      pt: "clamp(64px, 9vw, 120px)",
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
          color: themeVars(theme).palette.landing.note,
          pt: 1,
          transform: "rotate(-1.5deg)",
          transformOrigin: "left top",
          [theme.breakpoints.down("md")]: {
            transform: "none",
            mb: 5,
            pl: 3,
            py: 0.5,
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
