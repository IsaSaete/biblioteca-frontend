import { createTheme } from "@mui/material/styles";

// Tokens de sistema-diseno-visual.md traducidos a MUI (arquitectura-tecnica.md).
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "media" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#C1653D", contrastText: "#FFFFFF" },
        secondary: { main: "#F5DED2", contrastText: "#7A3D22" },
        background: { default: "#FFFFFF", paper: "#F7F5F1" },
        text: { primary: "#2B2620", secondary: "#6B6459" },
      },
    },
    dark: {
      palette: {
        primary: { main: "#E08A5F", contrastText: "#15130F" },
        secondary: { main: "#4A2E1F", contrastText: "#F0C9AE" },
        background: { default: "#15130F", paper: "#211E19" },
        text: { primary: "#F2ECE4", secondary: "#B8AFA0" },
      },
    },
  },
  breakpoints: { values: { xs: 0, sm: 768, md: 1024, lg: 1200, xl: 1536 } },
  shape: { borderRadius: 8 },
  spacing: 4,
  typography: {
    fontFamily: '"Inter", system-ui, sans-serif',
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    // Tamaño del logotipo (3rem). Pendiente de revisar frente a la escala de
    // sistema-diseno-visual.md: ver bitácora.
    h3: { fontSize: "3rem", fontWeight: 500, lineHeight: 1.3 },
    h6: { fontSize: "1.1875rem", fontWeight: 500, lineHeight: 1.3 },
    subtitle1: { fontSize: "1rem", lineHeight: 1.5 },
    body1: { fontSize: "0.875rem", lineHeight: 1.5 },
    body2: { fontSize: "0.875rem", lineHeight: 1.5 },
    caption: { fontSize: "0.75rem", lineHeight: 1.5 },
    button: { fontSize: "0.875rem", fontWeight: 500, textTransform: "none" },
  },
});

export default theme;
