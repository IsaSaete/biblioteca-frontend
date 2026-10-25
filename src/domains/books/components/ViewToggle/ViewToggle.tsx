import ToolbarButton from "../../../../components/ui/ToolbarButton/ToolbarButton";
import type { LibraryView } from "../../dto/LibraryView";

interface ViewToggleProps {
  view: LibraryView;
  onChange: (view: LibraryView) => void;
}

const Icon = ({ children }: { children: React.ReactNode }) => (
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
    {children}
  </svg>
);

const GridIcon = () => (
  <Icon>
    <rect x="4" y="4" width="7" height="7" rx="1" />
    <rect x="13" y="4" width="7" height="7" rx="1" />
    <rect x="4" y="13" width="7" height="7" rx="1" />
    <rect x="13" y="13" width="7" height="7" rx="1" />
  </Icon>
);

const ListIcon = () => (
  <Icon>
    <path d="M9 6h11M9 12h11M9 18h11" />
    <path d="M4 6h.01M4 12h.01M4 18h.01" />
  </Icon>
);

// Alterna la Biblioteca entre cuadrícula y lista (HU-10). Muestra el icono de
// la vista a la que se cambiaría, como el botón de vista de Spotify o Apple Books.
const ViewToggle = ({ view, onChange }: ViewToggleProps) => (
  <ToolbarButton
    icon={view === "grid" ? <ListIcon /> : <GridIcon />}
    ariaLabel={view === "grid" ? "Ver en lista" : "Ver en cuadrícula"}
    onClick={() => onChange(view === "grid" ? "list" : "grid")}
  />
);

export default ViewToggle;
