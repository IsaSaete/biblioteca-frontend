import { useColorScheme } from "@mui/material/styles";
import PreferenceSelector from "../PreferenceSelector/PreferenceSelector";

type ThemeMode = "light" | "dark" | "system";

const options: { value: ThemeMode; label: string }[] = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Oscuro" },
  { value: "system", label: "Sistema" },
];

// El modo lo gestiona y guarda MUI (`useColorScheme`): sigue al sistema por
// defecto y no hay que duplicarlo en Redux.
const ThemeSelector = () => {
  const { mode, setMode } = useColorScheme();

  return (
    <PreferenceSelector
      label="Tema"
      options={options}
      value={mode ?? "system"}
      onChange={setMode}
    />
  );
};

export default ThemeSelector;
