import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { addBookContent } from "../../content/landingContent";
import { themeVars } from "../../themeVars";
import LandingSection from "../LandingSection/LandingSection";
import SectionTitle from "../SectionTitle/SectionTitle";

// Índice con puntos guía: el nombre de cada manera y, a la derecha, una pista.
const AddBookMethods = () => (
  <LandingSection note={addBookContent.note}>
    <SectionTitle>{addBookContent.title}</SectionTitle>
    <Box
      component="ul"
      sx={{ listStyle: "none", m: 0, mt: 7, p: 0, display: "grid", gap: 4 }}
    >
      {addBookContent.methods.map((method) => (
        <Box
          key={method.name}
          component="li"
          sx={(theme) => ({
            display: "flex",
            alignItems: "center",
            gap: 3,
            [theme.breakpoints.down("md")]: { flexWrap: "wrap" },
          })}
        >
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
              flex: "1 1 24px",
              minWidth: 24,
              height: 0,
              borderBottom: `2px dotted ${themeVars(theme).palette.landing.lineStrong}`,
              [theme.breakpoints.down("md")]: { display: "none" },
            })}
          />
          <Typography
            variant="landingUi"
            component="span"
            sx={(theme) => ({
              fontWeight: 400,
              color: "text.secondary",
              textAlign: "right",
              maxWidth: "15em",
              [theme.breakpoints.down("md")]: {
                textAlign: "left",
                maxWidth: "none",
                flexBasis: "100%",
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
