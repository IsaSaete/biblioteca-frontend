import IconButton from "@mui/material/IconButton";
import { useColorScheme } from "@mui/material/styles";

const sun =
  "M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4";
const moon = "M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z";

// Alterna entre claro y oscuro. El modo lo guarda MUI (`useColorScheme`), el
// mismo que usa Perfil: la elección se mantiene al entrar en la app. Parte del
// modo del sistema y, al tocarlo, pasa al contrario del que se está viendo.
const ThemeSwitch = () => {
  const { mode, systemMode, setMode } = useColorScheme();
  const current = mode === "system" ? systemMode : mode;
  const isDark = current === "dark";

  return (
    <IconButton
      aria-label={isDark ? "Cambiar al modo claro" : "Cambiar al modo oscuro"}
      onClick={() => setMode(isDark ? "light" : "dark")}
      sx={{ width: 44, height: 44, color: "text.secondary" }}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={isDark ? sun : moon} />
      </svg>
    </IconButton>
  );
};

export default ThemeSwitch;
