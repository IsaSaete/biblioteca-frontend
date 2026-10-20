import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import BookmarkButton from "../BookmarkButton/BookmarkButton";
import NavItemLink from "../NavItemLink/NavItemLink";
import type { NavItem } from "../navItems";

interface SidebarProps {
  items: NavItem[];
}

export const SIDEBAR_WIDTH = 96;

// Versión de escritorio (≥1024px) de BottomNav: rail lateral fijo.
const Sidebar = ({ items }: SidebarProps) => (
  <Drawer
    variant="permanent"
    sx={{
      width: SIDEBAR_WIDTH,
      flexShrink: 0,
      "& .MuiDrawer-paper": {
        width: SIDEBAR_WIDTH,
        boxSizing: "border-box",
        bgcolor: "background.paper",
        borderRight: 1,
        borderColor: "divider",
      },
    }}
  >
    <Box
      component="nav"
      aria-label="Navegación principal"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: 2,
        py: 6,
        px: 2,
      }}
    >
      <BookmarkButton />
      {items.map((item) => (
        <NavItemLink key={item.id} item={item} placement="side" />
      ))}
    </Box>
  </Drawer>
);

export default Sidebar;
