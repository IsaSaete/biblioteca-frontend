import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { dictionaryContent } from "../../content/landingContent";
import { themeVars } from "../../themeVars";
import LandingSection from "../LandingSection/LandingSection";

// Banda oscura a todo el ancho: la entrada de diccionario «glosa» y su origen.
// Rompe el ritmo antes del cierre.
const DictionaryBand = () => (
  <LandingSection note={dictionaryContent.note} tone="band">
    <Typography
      variant="landingDisplay"
      component="h2"
      sx={{
        fontSize: "clamp(48px, 6.6vw, 76px)",
        lineHeight: 1,
        letterSpacing: "-0.02em",
      }}
    >
      {dictionaryContent.word}
      <Box
        component="i"
        sx={(theme) => ({
          ml: 2.5,
          fontSize: "0.36em",
          fontWeight: 400,
          color: themeVars(theme).palette.landing.onBandMuted,
        })}
      >
        {dictionaryContent.partOfSpeech}
      </Box>
    </Typography>
    <Typography
      variant="landingText"
      component="p"
      sx={(theme) => ({
        mt: 3,
        fontStyle: "italic",
        color: themeVars(theme).palette.landing.onBandMuted,
      })}
    >
      {dictionaryContent.etymology}
    </Typography>
    <Typography
      variant="landingDisplay"
      component="ol"
      sx={(theme) => ({
        m: 0,
        mt: 3,
        pl: "1.2em",
        maxWidth: "28em",
        fontSize: "1.08em",
        lineHeight: 1.5,
        "& li::marker": {
          color: themeVars(theme).palette.landing.bandAccent,
        },
      })}
    >
      {dictionaryContent.meanings.map((meaning) => (
        <li key={meaning}>{meaning}</li>
      ))}
    </Typography>
    <Typography
      variant="landingText"
      component="p"
      sx={{ mt: 7, maxWidth: "33em" }}
    >
      {dictionaryContent.origin}
    </Typography>
  </LandingSection>
);

export default DictionaryBand;
