import { Link } from "react-router";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";

interface SettingsRowProps {
  label: string;
  to: string;
}

// Misma fila que `PreferenceSelector`, pero lleva a otra pantalla.
const SettingsRow = ({ label, to }: SettingsRowProps) => (
  <ButtonBase
    component={Link}
    to={to}
    sx={{
      width: "100%",
      minHeight: 56,
      px: 2,
      justifyContent: "space-between",
      borderRadius: 2,
    }}
  >
    <Typography>{label}</Typography>
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  </ButtonBase>
);

export default SettingsRow;
