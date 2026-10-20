import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { Outlet, useSearchParams } from "react-router";
import AddBookModal from "../../../domains/books/components/AddBookModal/AddBookModal";
import BottomNav, { BOTTOM_NAV_HEIGHT } from "../BottomNav/BottomNav";
import { ADD_BOOK_MODAL } from "../addBookModal";
import { mainNavItems } from "../navItems";
import Sidebar from "../Sidebar/Sidebar";

// Estructura de las pantallas con sesión: barra inferior en móvil y tablet,
// rail lateral desde 1024px (pantallas-y-flujos.md, «Reglas de adaptación»).
const AppLayout = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [searchParams, setSearchParams] = useSearchParams();
  const isAddBookOpen = searchParams.get("modal") === ADD_BOOK_MODAL;

  const closeAddBook = () =>
    setSearchParams(
      (params) => {
        const next = new URLSearchParams(params);
        next.delete("modal");
        return next;
      },
      { replace: true },
    );

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
      {isAddBookOpen && <AddBookModal onClose={closeAddBook} />}
    </Box>
  );
};

export default AppLayout;
