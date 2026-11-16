import { forwardRef } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import Box from "@mui/material/Box";
import { getShowLabel } from "../../../books/utils/getShowLabel";
import { demoBooks, demoTags } from "../../content/demoLibrary";
import {
  countWithTag,
  hasDemoFilters,
  NO_DEMO_FILTERS,
} from "../../utils/demoFilters";
import type { DemoSelection } from "../../utils/demoFilters";
import { themeVars } from "../../themeVars";

export const SHEET_ID = "demo-filters-sheet";

interface DemoFiltersSheetProps {
  selection: DemoSelection;
  // Libros que cumplen lo elegido ahora.
  total: number;
  onChange: (selection: DemoSelection) => void;
  onClose: () => void;
}

// Los controles de la réplica miden 44 px de alto, como en la app y como pide
// la landing, aunque el resto del móvil de ejemplo esté a escala.
const TOUCH = 44;

const rowSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 2,
  width: "100%",
  minHeight: TOUCH,
  px: 1,
  fontSize: 13,
  textAlign: "left",
  color: "text.primary",
  bgcolor: "transparent",
  border: 0,
  borderRadius: "8px",
  cursor: "pointer",
  fontFamily: "inherit",
} as const;

const Switch = ({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) => (
  <Box
    component="button"
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={onToggle}
    sx={rowSx}
  >
    {label}
    <Box
      component="span"
      aria-hidden="true"
      sx={(theme) => ({
        position: "relative",
        flex: "0 0 auto",
        width: 36,
        height: 20,
        borderRadius: "999px",
        bgcolor: checked
          ? "primary.main"
          : themeVars(theme).palette.landing.lineStrong,
        transition: "background-color 140ms",
        "@media (prefers-reduced-motion: reduce)": { transition: "none" },
        "&::after": {
          content: '""',
          position: "absolute",
          top: 2,
          left: checked ? 18 : 2,
          width: 16,
          height: 16,
          borderRadius: "50%",
          bgcolor: "common.white",
          transition: "left 140ms",
          "@media (prefers-reduced-motion: reduce)": { transition: "none" },
        },
      })}
    />
  </Box>
);

const Heading = ({ children }: { children: ReactNode }) => (
  <Box
    component="h3"
    sx={{
      m: 0,
      mt: 2,
      mb: 0.5,
      px: 1,
      fontSize: 11.5,
      fontWeight: 500,
      color: "text.secondary",
    }}
  >
    {children}
  </Box>
);

// Réplica de la hoja «Filtros» de la app (mismos textos y orden): interruptores
// Favoritos y Prestados, etiquetas con su número, «Ver N libros» y «Limpiar».
// Cada toque se aplica al momento; «Ver N libros» solo cierra la hoja.
const DemoFiltersSheet = forwardRef<HTMLButtonElement, DemoFiltersSheetProps>(
  ({ selection, total, onChange, onClose }, closeRef) => {
    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };

    return (
      <Box
        sx={{ position: "absolute", inset: 0, zIndex: 2 }}
        onKeyDown={handleKeyDown}
      >
        {/* Velo del sistema de diseño: detrás de lo abierto, al 40 %. */}
        <Box
          aria-hidden="true"
          onClick={onClose}
          sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0, 0, 0, 0.4)" }}
        />
        <Box
          id={SHEET_ID}
          role="dialog"
          aria-label="Filtros"
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            maxHeight: "100%",
            overflowY: "auto",
            px: 3,
            pt: 2,
            pb: 3,
            bgcolor: "background.default",
            borderTopLeftRadius: "20px",
            borderTopRightRadius: "20px",
            color: "text.primary",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              minHeight: TOUCH,
              px: 1,
            }}
          >
            <Box component="h2" sx={{ m: 0, fontSize: 15, fontWeight: 500 }}>
              Filtros
            </Box>
            <Box
              ref={closeRef}
              component="button"
              type="button"
              aria-label="Cerrar filtros"
              onClick={onClose}
              sx={{
                width: TOUCH,
                height: TOUCH,
                mr: -1,
                display: "grid",
                placeItems: "center",
                color: "inherit",
                bgcolor: "transparent",
                border: 0,
                cursor: "pointer",
                fontSize: 18,
              }}
            >
              <span aria-hidden="true">✕</span>
            </Box>
          </Box>
          <Switch
            label="Favoritos"
            checked={selection.favorite}
            onToggle={() =>
              onChange({ ...selection, favorite: !selection.favorite })
            }
          />
          <Switch
            label="Prestados"
            checked={selection.lent}
            onToggle={() => onChange({ ...selection, lent: !selection.lent })}
          />
          <Heading>Etiquetas</Heading>
          {demoTags.map(({ id, label }) => {
            const selected = selection.tag === id;

            return (
              <Box
                key={id}
                component="button"
                type="button"
                aria-pressed={selected}
                onClick={() =>
                  onChange({ ...selection, tag: selected ? undefined : id })
                }
                sx={{ ...rowSx, fontWeight: selected ? 500 : 400 }}
              >
                <span>
                  {selected && <span aria-hidden="true">✓ </span>}
                  {label}
                </span>
                <Box component="span" sx={{ color: "text.secondary" }}>
                  {countWithTag(demoBooks, id)}
                </Box>
              </Box>
            );
          })}
          <Box sx={{ display: "grid", gap: 1, pt: 3 }}>
            <Box
              component="button"
              type="button"
              onClick={onClose}
              sx={{
                minHeight: TOUCH,
                fontSize: 13,
                fontWeight: 500,
                fontFamily: "inherit",
                cursor: "pointer",
                border: 0,
                borderRadius: "999px",
                bgcolor: "primary.main",
                color: "primary.contrastText",
              }}
            >
              {getShowLabel(total)}
            </Box>
            <Box
              component="button"
              type="button"
              disabled={!hasDemoFilters(selection)}
              onClick={() => onChange({ ...NO_DEMO_FILTERS })}
              sx={{
                minHeight: TOUCH,
                fontSize: 13,
                fontFamily: "inherit",
                cursor: "pointer",
                border: 0,
                bgcolor: "transparent",
                color: "primary.main",
                "&:disabled": { color: "text.disabled", cursor: "default" },
              }}
            >
              Limpiar
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
);

DemoFiltersSheet.displayName = "DemoFiltersSheet";

export default DemoFiltersSheet;
