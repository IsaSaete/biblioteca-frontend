import Box from "@mui/material/Box";
import Pill from "../../../../components/ui/Pill/Pill";
import type { BookStatus } from "../../dto/BookStatus";
import { statusOptions } from "../../utils/statusOptions";

interface ReadingStatusPickerProps {
  value: BookStatus;
  onChange: (status: BookStatus) => void;
}

// Estado de lectura al añadir el libro (HU-19).
const ReadingStatusPicker = ({ value, onChange }: ReadingStatusPickerProps) => (
  <Box
    role="group"
    aria-label="Estado de lectura"
    sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}
  >
    {statusOptions.map(({ value: option, label, tone }) => (
      <Pill
        key={option}
        label={label}
        tone={tone}
        fullWidth
        selected={value === option}
        onClick={() => onChange(option)}
      />
    ))}
  </Box>
);

export default ReadingStatusPicker;
