import { Link as RouterLink } from "react-router";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import type { Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { footerContent } from "../../content/landingContent";
import { themeVars } from "../../themeVars";

// Pie mínimo: los enlaces legales deben poder alcanzarse desde cualquier
// dispositivo, también en móvil.
const LandingFooter = () => {
  const linkSx = (theme: Theme) => ({
    ...theme.typography.landingUi,
    color: themeVars(theme).palette.landing.onBandMuted,
    py: 3,
  });

  return (
    <Box
      component="footer"
      sx={(theme) => ({
        // Banda oscura a todo el ancho que cierra la página.
        bgcolor: themeVars(theme).palette.landing.band,
        color: themeVars(theme).palette.landing.onBand,
        boxShadow: `0 0 0 100vmax ${themeVars(theme).palette.landing.band}`,
        clipPath: "inset(0 -100vmax)",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "4px 28px",
        pt: 6,
        // En móvil deja sitio a la barra fija de «Crear cuenta».
        pb: {
          xs: "calc(84px + env(safe-area-inset-bottom))",
          sm: "calc(32px + env(safe-area-inset-bottom))",
        },
      })}
    >
      <Typography
        variant="landingDisplay"
        component="span"
        sx={{ fontSize: 26, lineHeight: 1 }}
      >
        {footerContent.brand}
      </Typography>
      <Box component="nav" aria-label="Legal" sx={{ display: "flex", gap: 5 }}>
        <Link component={RouterLink} to="/login" underline="hover" sx={linkSx}>
          {footerContent.signIn}
        </Link>
        <Link
          component={RouterLink}
          to="/privacy"
          underline="hover"
          sx={linkSx}
        >
          {footerContent.privacy}
        </Link>
        <Link component={RouterLink} to="/terms" underline="hover" sx={linkSx}>
          {footerContent.terms}
        </Link>
      </Box>
      <Typography
        variant="landingUi"
        sx={(theme) => ({
          fontWeight: 400,
          color: themeVars(theme).palette.landing.onBandMuted,
        })}
      >
        {footerContent.copyright}
      </Typography>
    </Box>
  );
};

export default LandingFooter;
