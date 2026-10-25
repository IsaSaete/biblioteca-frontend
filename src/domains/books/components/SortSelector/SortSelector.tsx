import { useState } from "react";
import type { ChangeEvent } from "react";
import ButtonBase from "@mui/material/ButtonBase";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import BottomSheet from "../../../../components/ui/BottomSheet/BottomSheet";
import type { BooksSort } from "../../dto/GetBooksParams";
import { sortLabels } from "../../utils/libraryFilters";

interface SortSelectorProps {
  value: BooksSort;
  onChange: (sort: BooksSort) => void;
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

const ChevronDownIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 9l7 7 7-7" />
  </svg>
);

const sorts = Object.keys(sortLabels) as BooksSort[];

const isBooksSort = (value: string): value is BooksSort =>
  sorts.some((sort) => sort === value);

// «Orden» de Biblioteca: un botón de texto con el valor actual (un ajuste, no
// un filtro) que abre una hoja pequeña con las dos opciones (mismo criterio que
// «Tema» en Perfil).
const SortSelector = ({ value, onChange }: SortSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isBooksSort(event.target.value)) {
      onChange(event.target.value);
      setIsOpen(false);
    }
  };

  return (
    <>
      <ButtonBase
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        aria-label={`Ordenar por: ${sortLabels[value]}`}
        sx={{
          minHeight: 44,
          px: 2,
          gap: 2,
          borderRadius: 2,
          fontSize: "0.875rem",
          fontWeight: 500,
          "&.Mui-focusVisible": {
            outline: "2px solid",
            outlineColor: "primary.main",
          },
        }}
      >
        <SortIcon />
        {sortLabels[value]}
        <ChevronDownIcon />
      </ButtonBase>
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
          {sorts.map((sort) => (
            <FormControlLabel
              key={sort}
              value={sort}
              label={sortLabels[sort]}
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
