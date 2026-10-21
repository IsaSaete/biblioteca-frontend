import { useState } from "react";
import type { ChangeEvent } from "react";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import BottomSheet from "../../../../components/ui/BottomSheet/BottomSheet";
import Pill from "../../../../components/ui/Pill/Pill";
import type { BookStatus } from "../../dto/BookStatus";
import {
  getStatusPresentation,
  statusOptions,
} from "../../utils/statusOptions";

interface StatusSelectorProps {
  status: BookStatus;
  onChange: (status: BookStatus) => void;
  disabled?: boolean;
}

const isBookStatus = (value: string): value is BookStatus =>
  statusOptions.some((option) => option.value === value);

const ChevronIcon = () => (
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
    <path d="m6 9 6 6 6-6" />
  </svg>
);

// Solo se ve el estado actual, como pastilla; al tocarla se abre una hoja
// inferior con las opciones (mismo patrón que el selector de tema).
const StatusSelector = ({
  status,
  onChange,
  disabled = false,
}: StatusSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { label, tone } = getStatusPresentation(status);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isBookStatus(event.target.value)) {
      onChange(event.target.value);
      setIsOpen(false);
    }
  };

  return (
    <>
      <Box
        sx={{
          // Contenedor transparente: no altera la maquetación.
          display: "contents",
          // Un poco menos alta a la vista, con el área táctil de 44px intacta
          // (sistema-diseno-visual.md): la zona extra es invisible.
          "& .MuiChip-root": { height: 40, position: "relative" },
          "& .MuiChip-root::after": {
            content: '""',
            position: "absolute",
            inset: "-2px 0",
          },
        }}
      >
        <Pill
          label={
            <Box
              component="span"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 3,
              }}
            >
              {label}
              <ChevronIcon />
            </Box>
          }
          tone={tone}
          disabled={disabled}
          onClick={() => setIsOpen(true)}
        />
      </Box>
      <BottomSheet
        open={isOpen}
        title="Estado de lectura"
        onClose={() => setIsOpen(false)}
      >
        <RadioGroup
          aria-label="Estado de lectura"
          value={status}
          onChange={handleChange}
        >
          {statusOptions.map((option) => (
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

export default StatusSelector;
