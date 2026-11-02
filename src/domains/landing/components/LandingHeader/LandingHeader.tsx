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
      gap: 4,
      pt: 7,
      pb: 6,
    }}
  >
    <Brand to="/" />
    {/* Móvil: «Entrar» y «Crear cuenta» arriba y el interruptor de tema justo
        debajo, a la vista. Desde 768 px, todo en una fila. */}
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "flex-end", sm: "center" },
        gap: { xs: 1, sm: 5 },
      }}
    >
      <Box
        component="nav"
        aria-label="Principal"
        sx={{ display: "flex", alignItems: "center", gap: { xs: 3, sm: 5 } }}
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
            px: { xs: 4, sm: 5 },
            borderRadius: "999px",
            bgcolor: "primary.main",
            color: "primary.contrastText",
          })}
        >
          {header.signUp}
        </Link>
      </Box>
      <Box sx={{ order: { xs: 1, sm: -1 } }}>
        <ThemeSwitch />
      </Box>
    </Box>
  </Box>
);

export default LandingHeader;
