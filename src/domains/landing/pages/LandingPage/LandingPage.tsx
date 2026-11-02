import { preload } from "react-dom";
import Box from "@mui/material/Box";
import Bookshelf from "../../components/Bookshelf/Bookshelf";
import LandingHeader from "../../components/LandingHeader/LandingHeader";
import LandingIntro from "../../components/LandingIntro/LandingIntro";
import { useRedirectWhenSignedIn } from "../../hooks/useRedirectWhenSignedIn";
import "../../landingFonts.css";

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

  return (
    <Box
      sx={(theme) => ({
        ...theme.typography.landingText,
        minHeight: "100dvh",
        bgcolor: "background.default",
        color: "text.primary",
        px: "max(16px, env(safe-area-inset-left))",
        pb: 16,
      })}
    >
      <Box sx={{ maxWidth: 1120, mx: "auto" }}>
        <LandingHeader />
        <Box component="main">
          <Bookshelf />
          <LandingIntro />
        </Box>
      </Box>
    </Box>
  );
};

export default LandingPage;
