import { useState } from "react";
import type { ChangeEvent } from "react";
import ButtonBase from "@mui/material/ButtonBase";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Typography from "@mui/material/Typography";
import { useColorScheme } from "@mui/material/styles";
import BottomSheet from "../../../../components/ui/BottomSheet/BottomSheet";

type ThemeMode = "light" | "dark" | "system";

const options: { value: ThemeMode; label: string }[] = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Oscuro" },
  { value: "system", label: "Sistema" },
];

const isThemeMode = (value: string): value is ThemeMode =>
  options.some((option) => option.value === value);

// El modo lo gestiona y guarda MUI (`useColorScheme`): sigue al sistema por
// defecto y no hay que duplicarlo en Redux.
const ThemeSelector = () => {
  const { mode, setMode } = useColorScheme();
  const [isOpen, setIsOpen] = useState(false);
  const currentMode = mode ?? "system";
  const currentLabel =
    options.find((option) => option.value === currentMode)?.label ?? "Sistema";

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isThemeMode(event.target.value)) {
      setMode(event.target.value);
      setIsOpen(false);
    }
  };

  return (
    <>
      <ButtonBase
        onClick={() => setIsOpen(true)}
        sx={{
          width: "100%",
          minHeight: 56,
          px: 2,
          justifyContent: "space-between",
          borderRadius: 2,
        }}
      >
        <Typography>Tema</Typography>
        <Typography color="text.secondary">{currentLabel}</Typography>
      </ButtonBase>

      <BottomSheet open={isOpen} title="Tema" onClose={() => setIsOpen(false)}>
        <RadioGroup
          aria-label="Tema"
          value={currentMode}
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

export default ThemeSelector;
