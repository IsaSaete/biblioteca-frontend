import { useState } from "react";
import type { ChangeEvent } from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import BottomSheet from "../../../../components/ui/BottomSheet/BottomSheet";
import Pill from "../../../../components/ui/Pill/Pill";
import type { BooksSort } from "../../dto/GetBooksParams";
import { sortLabels } from "../../utils/libraryFilters";

interface SortSelectorProps {
  value: BooksSort;
  onChange: (sort: BooksSort) => void;
}

const sorts = Object.keys(sortLabels) as BooksSort[];

const isBooksSort = (value: string): value is BooksSort =>
  sorts.some((sort) => sort === value);

// «Orden» de Biblioteca: una píldora con el valor actual que abre una hoja
// pequeña con las dos opciones (mismo criterio que «Tema» en Perfil).
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
      <Pill
        tone="neutral"
        outlined
        hasPopup
        endIcon="chevron-down"
        label={`Orden: ${sortLabels[value]}`}
        onClick={() => setIsOpen(true)}
      />
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
