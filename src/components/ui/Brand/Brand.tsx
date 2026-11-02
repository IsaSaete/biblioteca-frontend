import { Link as RouterLink } from "react-router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import "../../../styles/landingFonts.css";

interface BrandProps {
  // Con `to`, el logotipo es un enlace (normalmente a la portada).
  to?: string;
  tagline?: boolean;
}

// Logotipo de Glosa: la marca en Besley con «Tu biblioteca personal» debajo,
// justificada al mismo ancho y pegada a ella. Es el mismo en la landing y en
// las pantallas de acceso.
const Brand = ({ to, tagline = true }: BrandProps) => (
  <Box
    {...(to ? { component: RouterLink, to } : { component: "span" })}
    aria-label={tagline ? "Glosa, tu biblioteca personal" : undefined}
    sx={{
      display: "inline-flex",
      flexDirection: "column",
      gap: "2px",
      color: "inherit",
      textDecoration: "none",
    }}
  >
    <Typography
      variant="landingDisplay"
      component="span"
      sx={{
        fontSize: "clamp(52px, 5.6vw, 64px)",
        lineHeight: 0.95,
        letterSpacing: "-0.015em",
      }}
    >
      Glosa
    </Typography>
    {tagline && (
      <Typography
        variant="landingUi"
        component="span"
        aria-hidden="true"
        sx={{
          // `width: 0` + `minWidth: 100%`: el texto toma el ancho de «Glosa»
          // sin ensancharlo, y `justify` reparte el espacio para igualarlos.
          width: 0,
          minWidth: "100%",
          whiteSpace: "nowrap",
          textAlign: "justify",
          textAlignLast: "justify",
          fontSize: "clamp(17px, 1.7vw, 20px)",
          fontWeight: 400,
          lineHeight: 1.2,
          color: "text.secondary",
        }}
      >
        Tu biblioteca personal
      </Typography>
    )}
  </Box>
);

export default Brand;
