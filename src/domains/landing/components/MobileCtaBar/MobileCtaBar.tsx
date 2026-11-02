import { Link as RouterLink } from "react-router";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { landingContent } from "../../content/landingContent";
import { themeVars } from "../../themeVars";

const { header } = landingContent;

interface MobileCtaBarProps {
  visible: boolean;
}

// Barra fija solo en móvil: «Crear cuenta» y «Entrar» siempre a mano cuando el
// botón de la portada ya no se ve y el del cierre todavía no. Oculta no se
// puede enfocar con el teclado.
const MobileCtaBar = ({ visible }: MobileCtaBarProps) => (
  <Box
    sx={(theme) => ({
      display: "none",
      [theme.breakpoints.down("sm")]: {
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: theme.zIndex.appBar,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 3,
        bgcolor: "background.default",
        borderTop: `1px solid ${themeVars(theme).palette.landing.lineStrong}`,
        pt: 2.5,
        pr: "max(16px, env(safe-area-inset-right))",
        pb: "calc(8px + env(safe-area-inset-bottom))",
        pl: "max(16px, env(safe-area-inset-left))",
        transform: visible ? "translateY(0)" : "translateY(110%)",
        visibility: visible ? "visible" : "hidden",
        transition: visible
          ? "transform 200ms ease-out"
          : "transform 200ms ease-out, visibility 0s linear 200ms",
        "@media (prefers-reduced-motion: reduce)": { transition: "none" },
      },
    })}
  >
    <Link
      component={RouterLink}
      to="/register"
      underline="none"
      sx={(theme) => ({
        ...theme.typography.landingUi,
        display: "inline-flex",
        alignItems: "center",
        minHeight: 44,
        px: 5,
        borderRadius: "999px",
        bgcolor: "primary.main",
        color: "primary.contrastText",
        whiteSpace: "nowrap",
      })}
    >
      {header.signUp}
    </Link>
    <Link
      component={RouterLink}
      to="/login"
      color="inherit"
      underline="always"
      sx={(theme) => ({
        ...theme.typography.landingUi,
        fontSize: "1.125rem",
        py: 3,
        textUnderlineOffset: "4px",
      })}
    >
      {header.signIn}
    </Link>
  </Box>
);

export default MobileCtaBar;
