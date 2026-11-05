import { Link as RouterLink } from "react-router";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Brand from "../../../../components/ui/Brand/Brand";
import { landingContent } from "../../content/landingContent";
import ThemeSwitch from "../ThemeSwitch/ThemeSwitch";

const { header } = landingContent;

const LandingHeader = () => (
  <Box
    component="header"
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: { xs: 3, sm: 4 },
      pt: 7,
      pb: 6,
    }}
  >
    <Brand to="/" />
    {/* El interruptor de tema solo se muestra desde 768 px: en móvil la landing
        sigue el modo del sistema y el cambio se hace desde Perfil (D-041). */}
    <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 3, sm: 5 } }}>
      <Box sx={{ display: { xs: "none", sm: "block" } }}>
        <ThemeSwitch />
      </Box>
      <Box
        component="nav"
        aria-label="Principal"
        sx={{ display: "flex", alignItems: "center", gap: { xs: 2, sm: 5 } }}
      >
        <Link
          component={RouterLink}
          to="/login"
          color="inherit"
          underline="always"
          sx={(theme) => ({
            ...theme.typography.landingUi,
            whiteSpace: "nowrap",
            py: 3,
            px: 1,
            textUnderlineOffset: "5px",
          })}
        >
          {header.signIn}
        </Link>
        <Link
          component={RouterLink}
          to="/register"
          underline="none"
          sx={(theme) => ({
            ...theme.typography.landingUi,
            whiteSpace: "nowrap",
            display: "inline-flex",
            alignItems: "center",
            minHeight: 44,
            px: { xs: 3, sm: 5 },
            borderRadius: "999px",
            bgcolor: "primary.main",
            color: "primary.contrastText",
          })}
        >
          {header.signUp}
        </Link>
      </Box>
    </Box>
  </Box>
);

export default LandingHeader;
