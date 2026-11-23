import Box from "@mui/material/Box";
import AddBookMethods from "../../components/AddBookMethods/AddBookMethods";
import Bookshelf from "../../components/Bookshelf/Bookshelf";
import QuotesSection from "../../components/QuotesSection/QuotesSection";
import TrustStrip from "../../components/TrustStrip/TrustStrip";
import TagsDemo from "../../components/TagsDemo/TagsDemo";
import ClosingSection from "../../components/ClosingSection/ClosingSection";
import DataSection from "../../components/DataSection/DataSection";
import DictionaryBand from "../../components/DictionaryBand/DictionaryBand";
import LandingFooter from "../../components/LandingFooter/LandingFooter";
import LandingHeader from "../../components/LandingHeader/LandingHeader";
import LandingIntro from "../../components/LandingIntro/LandingIntro";
import { useRedirectWhenSignedIn } from "../../hooks/useRedirectWhenSignedIn";
import { useWakeServer } from "../../hooks/useWakeServer";
import "../../../../styles/landingFonts.css";

// Las fuentes de la portada se piden con una cabecera `Link: rel=preload` solo
// para `/` (public/_headers), en paralelo con el JavaScript: precargarlas desde
// aquí llegaba tarde y las descargaba dos veces.
const LandingPage = () => {
  useRedirectWhenSignedIn();
  useWakeServer();

  return (
    <Box
      sx={(theme) => ({
        ...theme.typography.landingText,
        minHeight: "100dvh",
        bgcolor: "background.default",
        color: "text.primary",
        px: "max(16px, env(safe-area-inset-left))",
      })}
    >
      <Box sx={{ maxWidth: 1120, mx: "auto" }}>
        <LandingHeader />
        <Box component="main">
          <Bookshelf />
          <LandingIntro />
          <TrustStrip />
          <AddBookMethods />
          <QuotesSection />
          <DataSection />
          <TagsDemo />
          <DictionaryBand />
          <ClosingSection />
        </Box>
        <LandingFooter />
      </Box>
    </Box>
  );
};

export default LandingPage;
