import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import { NavLink } from "react-router";
import type { NavItem } from "../navItems";

interface NavItemLinkProps {
  item: NavItem;
  placement: "bottom" | "side";
}

// Icono sobre etiqueta. El estado activo se marca con el icono y un indicador
// en terracota (contraste suficiente para elementos gráficos, 3:1), pero la
// etiqueta usa el color de texto: el terracota claro no llega a 4,5:1 sobre
// la superficie para texto pequeño.
const NavItemLink = ({ item, placement }: NavItemLinkProps) => (
  <ButtonBase
    component={NavLink}
    to={item.to}
    sx={{
      position: "relative",
      flex: placement === "bottom" ? 1 : undefined,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 1,
      minWidth: 44,
      minHeight: 56,
      px: 2,
      py: 2,
      color: "text.secondary",
      "& .nav-label": { color: "inherit" },
      "&.active": { color: "primary.main" },
      "&.active .nav-label": { color: "text.primary" },
      "&.active::before": {
        content: '""',
        position: "absolute",
        borderRadius: "999px",
        backgroundColor: "primary.main",
        ...(placement === "bottom"
          ? { top: 0, left: "30%", right: "30%", height: 3 }
          : { left: 0, top: "25%", bottom: "25%", width: 3 }),
      },
    }}
  >
    <item.Icon />
    <Typography
      className="nav-label"
      component="span"
      sx={{ fontSize: "0.6875rem", lineHeight: 1.3, fontWeight: 500 }}
    >
      {item.label}
    </Typography>
  </ButtonBase>
);

export default NavItemLink;
