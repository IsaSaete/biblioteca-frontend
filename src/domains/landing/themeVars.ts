import type { Theme } from "@mui/material/styles";

// Con `cssVariables` activado, `theme.vars` apunta a variables CSS que cambian
// con el modo claro/oscuro; `theme.palette` solo trae el valor del modo activo
// al crear el tema. Si no hay variables (tema sin `cssVariables`, como en
// algunos tests) se usa la paleta tal cual.
export const themeVars = (theme: Theme) => theme.vars ?? theme;
