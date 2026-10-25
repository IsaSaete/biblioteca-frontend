import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";

interface FiltersButtonProps {
  // Cuántos filtros hay activos; 0 no muestra insignia.
  activeCount: number;
  onClick: () => void;
}

const SlidersIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="8" cy="17" r="2" />
  </svg>
);

// Botón «Filtros» de la barra de Biblioteca: relleno suave del color
// secundario, sin borde (como el botón de escanear), con la cuenta de filtros
// activos en una insignia.
const FiltersButton = ({ activeCount, onClick }: FiltersButtonProps) => (
  <ButtonBase
    onClick={onClick}
    aria-haspopup="dialog"
    aria-label={activeCount > 0 ? `Filtros, ${activeCount} activos` : "Filtros"}
    sx={{
      minHeight: 40,
      px: 4,
      gap: 2,
      borderRadius: "999px",
      bgcolor: "secondary.main",
      color: "secondary.contrastText",
      fontSize: "0.875rem",
      fontWeight: 500,
      "&.Mui-focusVisible": {
        outline: "2px solid",
        outlineColor: "primary.main",
        outlineOffset: 2,
      },
    }}
  >
    <SlidersIcon />
    Filtros
    {activeCount > 0 && (
      <Box
        component="span"
        aria-hidden="true"
        sx={{
          minWidth: 20,
          height: 20,
          px: 1,
          borderRadius: "999px",
          display: "grid",
          placeItems: "center",
          bgcolor: "primary.main",
          color: "primary.contrastText",
          fontSize: "0.75rem",
        }}
      >
        {activeCount}
      </Box>
    )}
  </ButtonBase>
);

export default FiltersButton;
