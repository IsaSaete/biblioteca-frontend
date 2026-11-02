import type { Ref } from "react";
import { Link as RouterLink } from "react-router";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import type { Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { footerContent } from "../../content/landingContent";
import { themeVars } from "../../themeVars";

// Pie mínimo: los enlaces legales deben poder alcanzarse desde cualquier
// dispositivo, también en móvil.
interface LandingFooterProps {
  // Para saber cuándo se ve el pie (la barra fija de móvil se oculta).
  footerRef?: Ref<HTMLElement>;
}

const LandingFooter = ({ footerRef }: LandingFooterProps) => {
  const linkSx = (theme: Theme) => ({
    ...theme.typography.landingUi,
    color: themeVars(theme).palette.landing.onBandMuted,
    py: 3,
  });

  return (
    <Box
      component="footer"
      ref={footerRef}
      sx={(theme) => ({
        // Banda oscura a todo el ancho que cierra la página.
        bgcolor: themeVars(theme).palette.landing.band,
        color: themeVars(theme).palette.landing.onBand,
        boxShadow: `0 0 0 100vmax ${themeVars(theme).palette.landing.band}`,
        clipPath: "inset(0 -100vmax)",
        display: "flex",
        // Móvil: todo en una sola línea. Desde 768 px puede pasar a otra.
        flexWrap: { xs: "nowrap", sm: "wrap" },
        alignItems: "center",
        justifyContent: "space-between",
        gap: { xs: 3, sm: "4px 28px" },
        pt: { xs: 3, sm: 6 },
        pb: "calc(16px + env(safe-area-inset-bottom))",
      })}
    >
      <Typography
        variant="landingDisplay"
        component="span"
        sx={{
          // En móvil el pie solo lleva los enlaces legales y el copyright.
          display: { xs: "none", sm: "inline" },
          fontSize: 26,
          lineHeight: 1,
        }}
      >
        {footerContent.brand}
      </Typography>
      <Box
        component="nav"
        aria-label="Legal"
        sx={{ display: "flex", gap: { xs: 3, sm: 5 } }}
      >
        {/* En móvil «Entrar» ya está en la cabecera y en la barra fija. */}
        <Link
          component={RouterLink}
          to="/login"
          underline="hover"
          sx={(theme) => ({
            ...linkSx(theme),
            display: { xs: "none", sm: "inline-flex" },
          })}
        >
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
          whiteSpace: "nowrap",
          color: themeVars(theme).palette.landing.onBandMuted,
        })}
      >
        {footerContent.copyright}
      </Typography>
    </Box>
  );
};

export default LandingFooter;
