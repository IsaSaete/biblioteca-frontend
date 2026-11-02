import Box from "@mui/material/Box";
import type { SpineColor } from "../../content/shelfBooks";
import { themeVars } from "../../themeVars";

export type MethodIconName = "scan" | "isbn" | "search" | "manual";

const paths: Record<Exclude<MethodIconName, "isbn">, string> = {
  scan: "M4 7V5a1 1 0 011-1h2M17 4h2a1 1 0 011 1v2M20 17v2a1 1 0 01-1 1h-2M7 20H5a1 1 0 01-1-1v-2M8 9v6M11 9v6M14 9v6M17 9v6",
  search: "M11 4.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM16 16l5 5",
  manual: "M4 20l1-4L16.5 4.5a2.1 2.1 0 013 3L8 19z",
};

interface MethodIconProps {
  name: MethodIconName;
  color: SpineColor;
}

// Icono redondo del color de un lomo. Decorativo: el nombre de la manera ya
// va en el texto de al lado.
const MethodIcon = ({ name, color }: MethodIconProps) => (
  <Box
    aria-hidden="true"
    component="span"
    sx={(theme) => ({
      ...theme.typography.landingUi,
      display: "grid",
      placeItems: "center",
      width: 44,
      height: 44,
      borderRadius: "50%",
      fontSize: "0.875rem",
      fontWeight: 700,
      bgcolor: themeVars(theme).palette.landing[`spine${color}`],
      color: themeVars(theme).palette.landing[`onSpine${color}`],
    })}
  >
    {name === "isbn" ? (
      "978"
    ) : (
      <Box
        component="svg"
        viewBox="0 0 24 24"
        sx={{
          width: 22,
          height: 22,
          fill: "none",
          stroke: "currentColor",
          strokeWidth: 1.9,
          strokeLinecap: "round",
          strokeLinejoin: "round",
        }}
      >
        <path d={paths[name]} />
      </Box>
    )}
  </Box>
);

export default MethodIcon;
