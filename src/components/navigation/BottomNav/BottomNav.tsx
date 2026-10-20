import { Fragment } from "react";
import Box from "@mui/material/Box";
import BookmarkButton from "../BookmarkButton/BookmarkButton";
import NavItemLink from "../NavItemLink/NavItemLink";
import type { NavItem } from "../navItems";

interface BottomNavProps {
  items: NavItem[];
}

export const BOTTOM_NAV_HEIGHT = 56;

const BottomNav = ({ items }: BottomNavProps) => (
  <Box
    component="nav"
    aria-label="Navegación principal"
    sx={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: "appBar",
      display: "flex",
      bgcolor: "background.paper",
      borderTop: 1,
      borderColor: "divider",
      pb: "env(safe-area-inset-bottom)",
    }}
  >
    {items.map((item, index) => (
      <Fragment key={item.id}>
        {index === Math.ceil(items.length / 2) && (
          <BookmarkButton placement="bottom" />
        )}
        <NavItemLink item={item} placement="bottom" />
      </Fragment>
    ))}
  </Box>
);

export default BottomNav;
