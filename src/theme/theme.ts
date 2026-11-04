import { createTheme } from "@mui/material/styles";

// Tokens de sistema-diseno-visual.md traducidos a MUI (arquitectura-tecnica.md).
// Variante tipográfica de las citas: Lora cursiva (sistema-diseno-visual.md).
// La landing pública tiene su propia voz (sistema-diseno-visual.md, «Landing
// pública»): colores añadidos para los lomos y las notas, y cuatro variantes
// tipográficas. La app con sesión no las usa.
export interface LandingPalette {
  spine1: string;
  spine2: string;
  spine3: string;
  spine4: string;
  spine5: string;
  spine6: string;
  onSpine1: string;
  onSpine2: string;
  onSpine3: string;
  onSpine4: string;
  onSpine5: string;
  onSpine6: string;
  plank: string;
  dashed: string;
  line: string;
  lineStrong: string;
  band: string;
  onBand: string;
  onBandMuted: string;
  bandAccent: string;
  note: string;
}

declare module "@mui/material/styles" {
  interface Palette {
    landing: LandingPalette;
  }
  interface PaletteOptions {
    landing?: LandingPalette;
  }
  interface TypographyVariants {
    quote: React.CSSProperties;
    landingDisplay: React.CSSProperties;
    landingText: React.CSSProperties;
    landingUi: React.CSSProperties;
    landingNote: React.CSSProperties;
  }
  interface TypographyVariantsOptions {
    quote?: React.CSSProperties;
    landingDisplay?: React.CSSProperties;
    landingText?: React.CSSProperties;
    landingUi?: React.CSSProperties;
    landingNote?: React.CSSProperties;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    quote: true;
    landingDisplay: true;
    landingText: true;
    landingUi: true;
    landingNote: true;
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
        landing: {
          spine1: "#AA5936",
          spine2: "#6F7F55",
          spine3: "#2B2620",
          spine4: "#8C8478",
          spine5: "#7A4B3A",
          spine6: "#C9A27E",
          onSpine1: "#FFFFFF",
          onSpine2: "#FFFFFF",
          onSpine3: "#F2ECE4",
          onSpine4: "#FFFFFF",
          onSpine5: "#F5DED2",
          onSpine6: "#2B2620",
          plank: "#B9AE9C",
          dashed: "#A39A8B",
          line: "#E6E0D6",
          lineStrong: "#CFC6B8",
          band: "#2B2620",
          onBand: "#F2ECE4",
          onBandMuted: "#B8AFA0",
          bandAccent: "#E9A987",
          note: "#8A4526",
        },
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
        landing: {
          spine1: "#E08A5F",
          spine2: "#8FA172",
          spine3: "#E5DCCD",
          spine4: "#7A7266",
          spine5: "#B9785F",
          spine6: "#B58E6A",
          onSpine1: "#15130F",
          onSpine2: "#15130F",
          onSpine3: "#15130F",
          onSpine4: "#15130F",
          onSpine5: "#15130F",
          onSpine6: "#15130F",
          plank: "#5A5144",
          dashed: "#7A7266",
          line: "#322D26",
          lineStrong: "#4A4339",
          // En modo oscuro la banda es del mismo color que el fondo de la
          // página: se distingue de las superficies que la rodean.
          band: "#15130F",
          onBand: "#F2ECE4",
          onBandMuted: "#B8AFA0",
          bandAccent: "#E9A987",
          note: "#E9A987",
        },
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
    // Landing pública: Besley (titulares y lomos), Alegreya (texto y notas) y
    // Alegreya Sans (interfaz, nunca por debajo de 17px), alojadas en /fonts.
    landingDisplay: {
      fontFamily: '"Besley", Georgia, serif',
      fontWeight: 500,
      lineHeight: 1.04,
    },
    landingText: {
      fontFamily: '"Alegreya", Georgia, serif',
      fontSize: "1.25rem",
      lineHeight: 1.55,
    },
    landingUi: {
      fontFamily: '"Alegreya Sans", system-ui, sans-serif',
      fontSize: "1.0625rem",
      fontWeight: 500,
      lineHeight: 1.4,
    },
    landingNote: {
      fontFamily: '"Alegreya", Georgia, serif',
      fontStyle: "italic",
      fontSize: "1.125rem",
      lineHeight: 1.25,
    },
    caption: { fontSize: "0.75rem", lineHeight: 1.5 },
    button: { fontSize: "0.875rem", fontWeight: 500, textTransform: "none" },
  },
  components: {
    // En modo oscuro MUI tiñe de gris el fondo de todo lo elevado (hojas,
    // diálogos, paneles) con un degradado. Aquí se quita para que todo use el
    // color de superficie del sistema de diseño, igual en claro y en oscuro.
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none" } },
    },
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
          // Al autorrellenar (contraseñas guardadas), Chrome y Safari pintan el
          // campo de azul y no dejan cambiarlo con `background`. Se combinan dos
          // técnicas, una por navegador, y se cubre el relleno con
          // el color de la superficie donde viven los campos (diálogos y
          // tarjetas) y se fija el color del texto. Se retrasa además el cambio
          // de fondo por si el navegador lo anima.
          "&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus, &:-webkit-autofill:active":
            {
              transition: "background-color 9999s ease-in-out 0s",
              // Chrome: recorta el fondo del autorrelleno a la forma del texto.
              WebkitBackgroundClip: "text",
              // Safari: ignora lo anterior y solo respeta la sombra interior.
              WebkitBoxShadow: `0 0 0 100px ${(theme.vars ?? theme).palette.background.paper} inset`,
              boxShadow: `0 0 0 100px ${(theme.vars ?? theme).palette.background.paper} inset`,
              WebkitTextFillColor: (theme.vars ?? theme).palette.text.primary,
              caretColor: (theme.vars ?? theme).palette.text.primary,
              // El relleno sigue la forma redondeada del campo.
              borderRadius: "inherit",
            },
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
