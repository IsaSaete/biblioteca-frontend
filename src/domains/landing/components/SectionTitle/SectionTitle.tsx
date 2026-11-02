import type { ReactNode } from "react";
import Typography from "@mui/material/Typography";

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <Typography
    variant="landingDisplay"
    component="h2"
    sx={{
      fontSize: "clamp(32px, 4.2vw, 50px)",
      lineHeight: 1.08,
      letterSpacing: "-0.012em",
      textWrap: "balance",
      maxWidth: "16em",
      mb: 5,
    }}
  >
    {children}
  </Typography>
);

export default SectionTitle;
