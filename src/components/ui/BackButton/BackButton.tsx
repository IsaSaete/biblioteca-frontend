import { useNavigate } from "react-router";
import IconButton from "@mui/material/IconButton";

interface BackButtonProps {
  fallbackTo: string;
}

// Vuelve a la pantalla anterior; si se entró directamente por el enlace (sin
// historial dentro de la app), va a `fallbackTo`.
const BackButton = ({ fallbackTo }: BackButtonProps) => {
  const navigate = useNavigate();

  const goBack = () => {
    const hasHistory = (window.history.state as { idx?: number } | null)?.idx;

    if (hasHistory) {
      void navigate(-1);
    } else {
      void navigate(fallbackTo);
    }
  };

  return (
    <IconButton
      aria-label="Volver"
      onClick={goBack}
      sx={{ width: 44, height: 44 }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </IconButton>
  );
};

export default BackButton;
