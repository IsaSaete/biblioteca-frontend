import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { addBookContent } from "../../content/landingContent";
import { themeVars } from "../../themeVars";
import BarcodeScan from "../BarcodeScan/BarcodeScan";
import MethodIcon from "../MethodIcon/MethodIcon";
import LandingSection from "../LandingSection/LandingSection";
import SectionTitle from "../SectionTitle/SectionTitle";

// Índice con puntos guía: el nombre de cada manera y, a la derecha, una pista.
const AddBookMethods = () => (
  <LandingSection note={addBookContent.note} tone="surface">
    <SectionTitle>{addBookContent.title}</SectionTitle>
    <BarcodeScan />
    <Box
      component="ul"
      sx={(theme) => ({
        listStyle: "none",
        m: 0,
        p: 0,
        display: "grid",
        gap: 0,
        [theme.breakpoints.up("md")]: { mt: 7, gap: 4 },
      })}
    >
      {addBookContent.methods.map((method) => (
        <Box
          key={method.name}
          component="li"
          sx={(theme) => ({
            // Móvil: icono a la izquierda y nombre con su pista debajo.
            display: "grid",
            gridTemplateColumns: "44px minmax(0, 1fr)",
            columnGap: 4,
            alignItems: "center",
            minHeight: 64,
            py: 3,
            borderTop: `1px solid ${themeVars(theme).palette.landing.line}`,
            // Escritorio: índice con puntos guía, sin iconos.
            [theme.breakpoints.up("md")]: {
              display: "flex",
              gap: 3,
              minHeight: 0,
              py: 0,
              borderTop: 0,
            },
          })}
        >
          <Box
            sx={(theme) => ({
              gridRow: "1 / span 2",
              display: "grid",
              [theme.breakpoints.up("md")]: { display: "none" },
            })}
          >
            <MethodIcon name={method.icon} color={method.color} />
          </Box>
          <Typography
            variant="landingDisplay"
            component="span"
            sx={{ fontSize: "1.2em", lineHeight: 1.3 }}
          >
            {method.name}
          </Typography>
          <Box
            aria-hidden="true"
            sx={(theme) => ({
              display: "none",
              [theme.breakpoints.up("md")]: {
                display: "block",
                flex: "1 1 24px",
                minWidth: 24,
                height: 0,
                borderBottom: `2px dotted ${themeVars(theme).palette.landing.lineStrong}`,
              },
            })}
          />
          <Typography
            variant="landingUi"
            component="span"
            sx={(theme) => ({
              fontWeight: 400,
              color: "text.secondary",
              [theme.breakpoints.up("md")]: {
                textAlign: "right",
                maxWidth: "15em",
              },
            })}
          >
            {method.hint}
          </Typography>
        </Box>
      ))}
    </Box>
    <Typography
      variant="landingText"
      component="p"
      sx={{ mt: 7, color: "text.secondary", maxWidth: "33em" }}
    >
      {addBookContent.sources}
    </Typography>
  </LandingSection>
);

export default AddBookMethods;
