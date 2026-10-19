import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { Outlet } from "react-router";
import BottomNav, { BOTTOM_NAV_HEIGHT } from "../BottomNav/BottomNav";
import { mainNavItems } from "../navItems";
import Sidebar from "../Sidebar/Sidebar";

// Estructura de las pantallas con sesión: barra inferior en móvil y tablet,
// rail lateral desde 1024px (pantallas-y-flujos.md, «Reglas de adaptación»).
const AppLayout = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Box sx={{ display: "flex" }}>
      {isDesktop && <Sidebar items={mainNavItems} />}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          pb: isDesktop
            ? 0
            : `calc(${BOTTOM_NAV_HEIGHT}px + env(safe-area-inset-bottom))`,
        }}
      >
        <Outlet />
      </Box>
      {!isDesktop && <BottomNav items={mainNavItems} />}
    </Box>
  );
};

export default AppLayout;
