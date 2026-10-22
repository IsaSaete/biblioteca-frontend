import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { Outlet, useMatches, useSearchParams } from "react-router";
import AddBookModal from "../../../domains/books/components/AddBookModal/AddBookModal";
import BottomNav, { BOTTOM_NAV_HEIGHT } from "../BottomNav/BottomNav";
import {
  ADD_BOOK_MODAL,
  ADD_BOOK_SCAN_STEP,
  ADD_BOOK_STEP_PARAM,
} from "../addBookModal";
import { mainNavItems } from "../navItems";
import Sidebar from "../Sidebar/Sidebar";
import TopBar from "../TopBar/TopBar";

// Estructura de las pantallas con sesión: barra inferior en móvil y tablet,
// rail lateral desde 1024px (pantallas-y-flujos.md, «Reglas de adaptación»).
const AppLayout = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [searchParams, setSearchParams] = useSearchParams();
  const isAddBookOpen = searchParams.get("modal") === ADD_BOOK_MODAL;
  const initialStep =
    searchParams.get(ADD_BOOK_STEP_PARAM) === ADD_BOOK_SCAN_STEP
      ? ADD_BOOK_SCAN_STEP
      : undefined;
  // Perfil no lleva barra superior: no hay libros que buscar ni añadir.
  const hasTopBar = useMatches().every(
    (match) =>
      (match.handle as { topBar?: boolean } | undefined)?.topBar !== false,
  );

  const closeAddBook = () =>
    setSearchParams(
      (params) => {
        const next = new URLSearchParams(params);
        next.delete("modal");
        next.delete(ADD_BOOK_STEP_PARAM);
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
        {hasTopBar && <TopBar />}
        <Outlet />
      </Box>
      {!isDesktop && <BottomNav items={mainNavItems} />}
      {isAddBookOpen && (
        <AddBookModal initialStep={initialStep} onClose={closeAddBook} />
      )}
    </Box>
  );
};

export default AppLayout;
