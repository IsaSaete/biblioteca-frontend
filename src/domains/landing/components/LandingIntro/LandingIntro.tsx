import type { Ref } from "react";
import { Link as RouterLink } from "react-router";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { landingContent } from "../../content/landingContent";

const { intro } = landingContent;

interface LandingIntroProps {
  // Para saber cuándo se ve el botón (la barra fija de móvil se oculta).
  ctaRef?: Ref<HTMLDivElement>;
}

const LandingIntro = ({ ctaRef }: LandingIntroProps) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: {
        xs: "minmax(0, 1fr)",
        md: "minmax(0, 1.5fr) minmax(0, 1fr)",
      },
      columnGap: "clamp(28px, 6vw, 88px)",
      rowGap: 8,
      alignItems: "end",
      pt: "clamp(40px, 6vw, 72px)",
      pb: "clamp(64px, 9vw, 120px)",
    }}
  >
    <Box>
      <Typography
        variant="landingDisplay"
        component="h1"
        sx={{
          fontSize: "clamp(40px, 5.2vw, 66px)",
          letterSpacing: "-0.02em",
          textWrap: "balance",
        }}
      >
        {intro.title}
      </Typography>
      <Box
        ref={ctaRef}
        sx={{
          mt: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 3,
        }}
      >
        <Link
          component={RouterLink}
          to="/register"
          underline="none"
          sx={(theme) => ({
            ...theme.typography.landingUi,
            display: "inline-flex",
            alignItems: "center",
            minHeight: 48,
            px: 6,
            borderRadius: "999px",
            bgcolor: "primary.main",
            color: "primary.contrastText",
          })}
        >
          {intro.signUp}
        </Link>
        <Typography
          variant="landingUi"
          sx={{ fontWeight: 400, color: "text.secondary" }}
        >
          {intro.fine}
        </Typography>
      </Box>
    </Box>
    <Box sx={{ maxWidth: "28em", pb: "0.3em" }}>
      <Typography variant="landingText" component="p">
        {intro.lede}
      </Typography>
      <Typography
        variant="landingText"
        component="p"
        sx={{ mt: 4, color: "text.secondary" }}
      >
        {intro.ledeAfter}
      </Typography>
    </Box>
  </Box>
);

export default LandingIntro;
