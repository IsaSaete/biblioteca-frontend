import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { dataContent } from "../../content/landingContent";
import { themeVars } from "../../themeVars";
import LandingSection from "../LandingSection/LandingSection";
import SectionTitle from "../SectionTitle/SectionTitle";

const DataSection = () => (
  <LandingSection tone="surface">
    <SectionTitle>{dataContent.title}</SectionTitle>
    <Box sx={{ display: "grid", gap: 4, maxWidth: "34em" }}>
      {dataContent.points.map(({ lead, text }) => (
        <Typography key={lead} variant="landingText" component="p">
          <Box
            component="em"
            sx={(theme) => ({
              fontStyle: "normal",
              fontWeight: 500,
              color: themeVars(theme).palette.landing.note,
            })}
          >
            {lead}
          </Box>{" "}
          {text}
        </Typography>
      ))}
    </Box>
  </LandingSection>
);

export default DataSection;
