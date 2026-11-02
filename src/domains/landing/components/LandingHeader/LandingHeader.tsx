import { Link as RouterLink } from "react-router";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { landingContent } from "../../content/landingContent";

const { brand, header } = landingContent;

const LandingHeader = () => (
  <Box
    component="header"
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 4,
      pt: 7,
      pb: 6,
    }}
  >
    <Box
      component={RouterLink}
      to="/"
      aria-label={`${brand.name}, ${brand.tagline.toLowerCase()}`}
      sx={{
        display: "inline-flex",
        flexDirection: "column",
        gap: 2,
        color: "inherit",
        textDecoration: "none",
      }}
    >
      <Typography
        variant="landingDisplay"
        component="span"
        sx={{
          fontSize: "clamp(44px, 5.6vw, 64px)",
          lineHeight: 0.95,
          letterSpacing: "-0.015em",
        }}
      >
        {brand.name}
      </Typography>
      <Typography
        variant="landingUi"
        component="span"
        sx={{
          fontSize: "clamp(17px, 1.7vw, 20px)",
          fontWeight: 400,
          color: "text.secondary",
        }}
      >
        {brand.tagline}
      </Typography>
    </Box>
    <Box
      component="nav"
      aria-label="Principal"
      sx={{ display: "flex", alignItems: "center", gap: { xs: 3, sm: 5 } }}
    >
      <Link
        component={RouterLink}
        to="/login"
        color="inherit"
        underline="always"
        sx={(theme) => ({
          ...theme.typography.landingUi,
          py: 3,
          px: 1,
          textUnderlineOffset: "5px",
        })}
      >
        {header.signIn}
      </Link>
      <Link
        component={RouterLink}
        to="/register"
        underline="none"
        sx={(theme) => ({
          ...theme.typography.landingUi,
          display: "inline-flex",
          alignItems: "center",
          minHeight: 44,
          px: 5,
          borderRadius: "999px",
          bgcolor: "primary.main",
          color: "primary.contrastText",
        })}
      >
        {header.signUp}
      </Link>
    </Box>
  </Box>
);

export default LandingHeader;
