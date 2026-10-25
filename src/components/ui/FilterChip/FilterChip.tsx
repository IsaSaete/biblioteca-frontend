import ButtonBase from "@mui/material/ButtonBase";

interface FilterChipProps {
  label: string;
  // Cuántos elementos tiene (por ejemplo, libros con esa etiqueta).
  count?: number;
  selected: boolean;
  // Chip de un filtro ya activo: al tocarlo se quita, y lo indica con una ✕.
  removable?: boolean;
  onClick: () => void;
}

const RemoveIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

// Chip de filtro, más sobrio que `Pill`: 40px, sin sombra. En reposo lleva un
// contorno suave sobre el fondo de la pantalla; seleccionado se rellena con el
// color secundario del tema (como el botón de escanear). El borde de 1px está
// siempre, así que al seleccionarlo solo cambian los colores, nunca la forma.
const FilterChip = ({
  label,
  count,
  selected,
  removable = false,
  onClick,
}: FilterChipProps) => (
  <ButtonBase
    onClick={onClick}
    // Un chip de filtro activo no es un interruptor: es la acción de quitarlo.
    aria-pressed={removable ? undefined : selected}
    aria-label={removable ? `Quitar el filtro ${label}` : undefined}
    sx={{
      minHeight: 40,
      px: 4,
      gap: 1.5,
      borderRadius: "999px",
      border: 1,
      borderColor: "secondary.main",
      bgcolor: selected ? "secondary.main" : "background.default",
      color: selected ? "secondary.contrastText" : "text.primary",
      fontSize: "0.875rem",
      fontWeight: selected ? 500 : 400,
      "&.Mui-focusVisible": {
        outline: "2px solid",
        outlineColor: "primary.main",
        outlineOffset: 2,
      },
    }}
  >
    {label}
    {count !== undefined && (
      <>
        {/* El espacio es para el nombre accesible («Poesía 2»); en el flex no se ve. */}{" "}
        <span style={{ opacity: 0.7 }}>{count}</span>
      </>
    )}
    {removable && <RemoveIcon />}
  </ButtonBase>
);

export default FilterChip;
