import { useState } from "react";
import type { ChangeEvent } from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import BottomSheet from "../BottomSheet/BottomSheet";
import ToolbarButton from "../ToolbarButton/ToolbarButton";

export interface SortOption<T extends string> {
  value: T;
  // Texto completo, en la hoja y para lectores de pantalla.
  label: string;
  // Texto corto para el botón; sin él, se usa `label`.
  shortLabel?: string;
}

interface SortSelectorProps<T extends string> {
  options: SortOption<T>[];
  value: T;
  onChange: (sort: T) => void;
}

const SortIcon = () => (
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
    <path d="M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l-3 3M17 4l3 3" />
  </svg>
);

// «Orden» de una lista: un botón de texto con el valor actual (un ajuste, no
// un filtro) que abre una hoja pequeña con las opciones (mismo criterio que
// «Tema» en Perfil). Lo usan Biblioteca y Citas.
const SortSelector = <T extends string>({
  options,
  value,
  onChange,
}: SortSelectorProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const current = options.find((option) => option.value === value);
  const currentLabel = current?.label ?? "";

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const chosen = options.find(
      (option) => option.value === event.target.value,
    );

    if (chosen) {
      onChange(chosen.value);
      setIsOpen(false);
    }
  };

  return (
    <>
      <ToolbarButton
        icon={<SortIcon />}
        hasChevron
        ariaLabel={`Ordenar por: ${currentLabel}`}
        onClick={() => setIsOpen(true)}
      >
        {current?.shortLabel ?? currentLabel}
      </ToolbarButton>
      <BottomSheet
        open={isOpen}
        title="Ordenar por"
        onClose={() => setIsOpen(false)}
      >
        <RadioGroup
          aria-label="Ordenar por"
          value={value}
          onChange={handleChange}
        >
          {options.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              label={option.label}
              control={<Radio />}
              sx={{ minHeight: 44 }}
            />
          ))}
        </RadioGroup>
      </BottomSheet>
    </>
  );
};

export default SortSelector;
