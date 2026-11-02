import type { Ref } from "react";
import { Link as RouterLink } from "react-router";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { closingContent } from "../../content/landingContent";
import LandingSection from "../LandingSection/LandingSection";
import SectionTitle from "../SectionTitle/SectionTitle";

interface ClosingSectionProps {
  // Para saber cuándo se ve este botón (la barra fija de móvil se oculta).
  ctaRef?: Ref<HTMLDivElement>;
}

const ClosingSection = ({ ctaRef }: ClosingSectionProps) => (
  <LandingSection>
    <SectionTitle>{closingContent.title}</SectionTitle>
    <Typography
      variant="landingText"
      component="p"
      sx={{ color: "text.secondary" }}
    >
      {closingContent.text}
    </Typography>
    <Box
      ref={ctaRef}
      sx={{
        mt: 6,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 3,
      }}
    >
      <Link
        component={RouterLink}
        to="/register"
        underline="none"
        sx={(theme) => ({
          ...theme.typography.landingUi,
          display: "inline-flex",
          alignItems: "center",
          // Algo mayor que los demás botones: es la última llamada.
          minHeight: 56,
          px: 8,
          fontSize: "1.1875rem",
          borderRadius: "999px",
          bgcolor: "primary.main",
          color: "primary.contrastText",
        })}
      >
        {closingContent.signUp}
      </Link>
      <Typography
        variant="landingUi"
        component="p"
        sx={{ fontWeight: 400, color: "text.secondary" }}
      >
        {closingContent.fine}
      </Typography>
    </Box>
  </LandingSection>
);

export default ClosingSection;
