import type { Ref } from "react";
import { Link as RouterLink } from "react-router";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import type { Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { footerContent } from "../../content/landingContent";
import { visuallyHidden } from "../../../../utils/visuallyHidden";
import { themeVars } from "../../themeVars";

// Pie mínimo: FAQ y los enlaces legales deben poder alcanzarse desde cualquier
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
        // Enlaces a la izquierda y © a la derecha; si no caben, el © pasa abajo.
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: { xs: "0 12px", sm: "4px 28px" },
        pt: { xs: 3, sm: 6 },
        pb: "calc(16px + env(safe-area-inset-bottom))",
      })}
    >
      <Box
        component="nav"
        aria-label="Información"
        sx={{ display: "flex", gap: { xs: 3, sm: 5 } }}
      >
        <Link component={RouterLink} to="/faq" underline="hover" sx={linkSx}>
          {footerContent.faq}
          {/* Un lector de pantalla deletrearía «FAQ»: se completa sin cambiar lo visible. */}
          <Box component="span" sx={visuallyHidden}>
            {footerContent.faqSpoken}
          </Box>
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
