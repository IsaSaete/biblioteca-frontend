import { preload } from "react-dom";
import Box from "@mui/material/Box";
import AddBookMethods from "../../components/AddBookMethods/AddBookMethods";
import Bookshelf from "../../components/Bookshelf/Bookshelf";
import QuotesSection from "../../components/QuotesSection/QuotesSection";
import TagsDemo from "../../components/TagsDemo/TagsDemo";
import ClosingSection from "../../components/ClosingSection/ClosingSection";
import DataSection from "../../components/DataSection/DataSection";
import DictionaryBand from "../../components/DictionaryBand/DictionaryBand";
import LandingFooter from "../../components/LandingFooter/LandingFooter";
import MobileCtaBar from "../../components/MobileCtaBar/MobileCtaBar";
import LandingHeader from "../../components/LandingHeader/LandingHeader";
import LandingIntro from "../../components/LandingIntro/LandingIntro";
import { useInView } from "../../hooks/useInView";
import { useRedirectWhenSignedIn } from "../../hooks/useRedirectWhenSignedIn";
import "../../../../styles/landingFonts.css";

// Las tres fuentes que pintan la portada se piden desde el principio; el resto
// se descarga solo si hay texto que las necesita.
const criticalFonts = [
  "besley-normal-500-latin",
  "alegreya-normal-400-700-latin",
  "alegreya-sans-normal-500-latin",
];

const LandingPage = () => {
  criticalFonts.forEach((font) =>
    preload(`/fonts/${font}.woff2`, {
      as: "font",
      type: "font/woff2",
      crossOrigin: "anonymous",
    }),
  );

  useRedirectWhenSignedIn();

  // La barra fija de móvil sale cuando el botón de la portada ya no se ve y
  // ni el del cierre ni el pie están a la vista.
  const heroCta = useInView<HTMLDivElement>(true);
  const closingCta = useInView<HTMLDivElement>(false);
  const footer = useInView<HTMLElement>(false);

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
          <LandingIntro ctaRef={heroCta.ref} />
          <AddBookMethods />
          <TagsDemo />
          <QuotesSection />
          <DataSection />
          <DictionaryBand />
          <ClosingSection ctaRef={closingCta.ref} />
        </Box>
        <LandingFooter footerRef={footer.ref} />
      </Box>
      <MobileCtaBar
        visible={!heroCta.inView && !closingCta.inView && !footer.inView}
      />
    </Box>
  );
};

export default LandingPage;
