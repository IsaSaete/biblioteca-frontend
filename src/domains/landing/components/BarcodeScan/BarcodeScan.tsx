import Box from "@mui/material/Box";
import { themeVars } from "../../themeVars";

const corners = [
  { top: 0, left: 0, borderWidth: "3px 0 0 3px", borderTopLeftRadius: 7 },
  { top: 0, right: 0, borderWidth: "3px 3px 0 0", borderTopRightRadius: 7 },
  { bottom: 0, left: 0, borderWidth: "0 0 3px 3px", borderBottomLeftRadius: 7 },
  {
    bottom: 0,
    right: 0,
    borderWidth: "0 3px 3px 0",
    borderBottomRightRadius: 7,
  },
];

// Un código de barras dentro del marco de la cámara: lo que se ve al escanear.
// Solo en móvil, donde es la manera principal de añadir un libro. Es estático
// (el único movimiento de la landing es el de las citas) y decorativo.
const BarcodeScan = () => (
  <Box
    aria-hidden="true"
    sx={(theme) => ({
      display: "grid",
      justifyItems: "center",
      my: 7,
      [theme.breakpoints.up("md")]: { display: "none" },
    })}
  >
    <Box sx={{ position: "relative", width: 168, py: 4, px: 4 }}>
      <Box
        sx={(theme) => {
          const ink = themeVars(theme).palette.text.primary;

          return {
            height: 64,
            backgroundImage: `repeating-linear-gradient(90deg, ${ink} 0 2px, transparent 2px 4px, ${ink} 4px 5px, transparent 5px 8px, ${ink} 8px 11px, transparent 11px 13px, ${ink} 13px 14px, transparent 14px 17px)`,
          };
        }}
      />
      <Box
        sx={(theme) => ({
          ...theme.typography.landingUi,
          mt: 2,
          fontSize: "0.875rem",
          letterSpacing: "0.08em",
          textAlign: "center",
          color: "text.secondary",
        })}
      >
        9 788491 050001
      </Box>
      {corners.map((corner, index) => (
        <Box
          key={index}
          component="i"
          sx={(theme) => ({
            position: "absolute",
            width: 20,
            height: 20,
            border: "0 solid",
            borderColor: themeVars(theme).palette.primary.main,
            ...corner,
          })}
        />
      ))}
      <Box
        sx={(theme) => ({
          position: "absolute",
          left: 8,
          right: 8,
          top: "42%",
          height: 2,
          bgcolor: themeVars(theme).palette.primary.main,
        })}
      />
    </Box>
  </Box>
);

export default BarcodeScan;
