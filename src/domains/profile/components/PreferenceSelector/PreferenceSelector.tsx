import type { ChangeEvent } from "react";
import ButtonBase from "@mui/material/ButtonBase";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Typography from "@mui/material/Typography";
import OptionsPanel from "../../../../components/ui/OptionsPanel/OptionsPanel";
import { useAnchoredPanel } from "../../../../hooks/useAnchoredPanel";

interface PreferenceSelectorProps<Value extends string> {
  label: string;
  options: { value: Value; label: string }[];
  value: Value;
  onChange: (value: Value) => void;
}

// Fila de Perfil con la preferencia actual a la derecha; al pulsarla abre un
// panel con las opciones. Elegir una la aplica y cierra el panel.
const PreferenceSelector = <Value extends string>({
  label,
  options,
  value,
  onChange,
}: PreferenceSelectorProps<Value>) => {
  const panel = useAnchoredPanel();
  const currentLabel =
    options.find((option) => option.value === value)?.label ?? "";

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const chosen = options.find(
      (option) => option.value === event.target.value,
    );

    if (chosen) {
      onChange(chosen.value);
      panel.close();
    }
  };

  return (
    <>
      <ButtonBase
        aria-haspopup="dialog"
        aria-expanded={panel.isOpen}
        onClick={panel.open}
        sx={{
          width: "100%",
          minHeight: 56,
          px: 2,
          justifyContent: "space-between",
          borderRadius: 2,
        }}
      >
        <Typography>{label}</Typography>
        <Typography color="text.secondary">{currentLabel}</Typography>
      </ButtonBase>

      <OptionsPanel
        open={panel.isOpen}
        title={label}
        anchorEl={panel.anchorEl}
        onClose={panel.close}
      >
        <RadioGroup aria-label={label} value={value} onChange={handleChange}>
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
      </OptionsPanel>
    </>
  );
};

export default PreferenceSelector;
