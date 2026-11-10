import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";

interface LentBadgeProps {
  // Diámetro del círculo en px.
  size: number;
  sx?: SxProps<Theme>;
}

// Marca de «libro prestado»: círculo terracota con una flecha. Es solo un
// refuerzo visual (el texto «Prestado a…» ya lo dice), por eso no se anuncia.
const LentBadge = ({ size, sx }: LentBadgeProps) => (
  <Box
    aria-hidden="true"
    sx={[
      {
        flex: "none",
        width: size,
        height: size,
        display: "grid",
        placeItems: "center",
        borderRadius: "50%",
        bgcolor: "primary.main",
        color: "primary.contrastText",
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <svg
      width={Math.round(size * 0.58)}
      height={Math.round(size * 0.58)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  </Box>
);

export default LentBadge;
