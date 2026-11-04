import { Link as RouterLink } from "react-router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import "../../../styles/landingFonts.css";

interface BrandProps {
  // Con `to`, el logotipo es un enlace (normalmente a la portada).
  to?: string;
  tagline?: boolean;
  // Versión pequeña (40 px) para diálogos, donde la marca no debe competir con
  // el título.
  compact?: boolean;
  // Marca en el color de acento, en lugar del color del texto.
  accent?: boolean;
}

// Logotipo de Glosa: la marca en Besley con «Tu biblioteca personal» debajo,
// justificada al mismo ancho y pegada a ella. Es el mismo en la landing y en
// las pantallas de acceso.
const Brand = ({
  to,
  tagline = true,
  compact = false,
  accent = false,
}: BrandProps) => (
  <Box
    {...(to ? { component: RouterLink, to } : { component: "span" })}
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
        fontSize: compact ? "40px" : "clamp(52px, 5.6vw, 64px)",
        color: accent ? "primary.main" : undefined,
        lineHeight: 0.95,
        letterSpacing: "-0.015em",
      }}
    >
      Glosa
    </Typography>
    {/* El espacio no se ve (el contenedor es flex) pero separa las dos
        palabras en el nombre accesible del enlace. */}
    {tagline && " "}
    {tagline && (
      <Typography
        variant="landingUi"
        component="span"
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
