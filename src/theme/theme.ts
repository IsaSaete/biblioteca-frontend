import { createTheme } from "@mui/material/styles";

// Tokens de sistema-diseno-visual.md traducidos a MUI (arquitectura-tecnica.md).
// Variante tipográfica de las citas: Lora cursiva (sistema-diseno-visual.md).
declare module "@mui/material/styles" {
  interface TypographyVariants {
    quote: React.CSSProperties;
  }
  interface TypographyVariantsOptions {
    quote?: React.CSSProperties;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    quote: true;
  }
}

// Velo oscuro al 40 % (sistema-diseno-visual.md, «Velo»).
const SCRIM = "rgba(0, 0, 0, 0.4)";

const theme = createTheme({
  cssVariables: { colorSchemeSelector: "data" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#AA5936", contrastText: "#FFFFFF" },
        secondary: { main: "#F5DED2", contrastText: "#7A3D22" },
        success: {
          main: "#3F6B52",
          light: "#E1EAE4",
          contrastText: "#FFFFFF",
        },
        background: { default: "#FFFFFF", paper: "#F7F5F1" },
        text: { primary: "#2B2620", secondary: "#6B6459" },
      },
    },
    dark: {
      palette: {
        primary: { main: "#E08A5F", contrastText: "#15130F" },
        secondary: { main: "#4A2E1F", contrastText: "#F0C9AE" },
        success: {
          main: "#6FA382",
          light: "#24402F",
          contrastText: "#15130F",
        },
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
    quote: {
      fontFamily: '"Lora", Georgia, serif',
      fontStyle: "italic",
      fontSize: "1rem",
      lineHeight: 1.6,
    },
    caption: { fontSize: "0.75rem", lineHeight: 1.5 },
    button: { fontSize: "0.875rem", fontWeight: 500, textTransform: "none" },
  },
  components: {
    // Velo detrás de hojas, paneles anclados y diálogos: el mismo para todos, para
    // que lo abierto gane protagonismo sin ocultar el contenido de detrás. Los
    // fondos invisibles (menús, selects) siguen sin velo.
    MuiBackdrop: {
      styleOverrides: {
        root: ({ ownerState }) =>
          ownerState.invisible ? {} : { backgroundColor: SCRIM },
      },
    },
    // Safari en iPhone amplía la página al enfocar un campo con menos de 16px y
    // no la devuelve a su tamaño: en móvil, los campos y su etiqueta usan
    // `text-lg` (16px) en lugar de `text-md` (14px).
    MuiInputBase: {
      styleOverrides: {
        input: ({ theme }) => ({
          [theme.breakpoints.down("sm")]: { fontSize: "1rem" },
        }),
      },
    },
    // MUI encoge la etiqueta con `scale(0.75)` (10,5–12px, muy pequeña): se sube
    // el factor para que mida 14px (`text-md`) en móvil y 12px (`text-sm`) desde
    // tablet. El hueco del borde (`legend`) debe medir lo mismo que la etiqueta
    // encogida, o el borde corta su última letra.
    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          [theme.breakpoints.down("sm")]: {
            fontSize: "1rem",
            "&.MuiInputLabel-shrink": {
              transform: "translate(14px, -10px) scale(0.875)",
            },
          },
          [theme.breakpoints.up("sm")]: {
            "&.MuiInputLabel-shrink": {
              transform: "translate(14px, -9px) scale(0.857)",
            },
          },
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: ({ theme }) => ({
          "& legend": {
            [theme.breakpoints.down("sm")]: { fontSize: "0.875rem" },
            [theme.breakpoints.up("sm")]: { fontSize: "0.75rem" },
          },
        }),
      },
    },
  },
});

export default theme;
