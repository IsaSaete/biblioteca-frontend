import ToolbarButton from "../../../../components/ui/ToolbarButton/ToolbarButton";

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

// Botón «Filtros» de la barra de Biblioteca, con la cuenta de filtros activos
// en una insignia.
const FiltersButton = ({ activeCount, onClick }: FiltersButtonProps) => (
  <ToolbarButton
    icon={<SlidersIcon />}
    badge={activeCount}
    ariaLabel={activeCount > 0 ? `Filtros, ${activeCount} activos` : "Filtros"}
    onClick={onClick}
  >
    Filtros
  </ToolbarButton>
);

export default FiltersButton;
