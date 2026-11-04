import { Link as RouterLink } from "react-router";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

interface SectionHeaderProps {
  title: string;
  seeAllLabel: string;
  seeAllTo: string;
}

// Cabecera de una sección de Inicio: título a la izquierda y «Ver todos ›» a la
// derecha.
const SectionHeader = ({
  title,
  seeAllLabel,
  seeAllTo,
}: SectionHeaderProps) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: 4,
      mb: 3,
    }}
  >
    <Typography component="h2" variant="h6">
      {title}
    </Typography>
    <Link
      component={RouterLink}
      to={seeAllTo}
      underline="hover"
      // Área táctil de 44px sin alargar la cabecera: la altura extra se
      // compensa con margen negativo.
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        minHeight: 44,
        my: -3,
      }}
    >
      {seeAllLabel} <span aria-hidden="true">›</span>
    </Link>
  </Box>
);

export default SectionHeader;
