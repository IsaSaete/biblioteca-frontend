import { useId } from "react";
import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface SettingsGroupProps {
  // Sin título, el grupo es solo la tarjeta (Cerrar sesión).
  title?: string;
  children: ReactNode;
}

// Tarjeta de superficie con sus filas separadas por una línea fina. El título,
// si lo hay, va fuera, encima.
const SettingsGroup = ({ title, children }: SettingsGroupProps) => {
  const titleId = useId();

  return (
    <Box component="section" aria-labelledby={title ? titleId : undefined}>
      {title && (
        <Typography
          id={titleId}
          component="h2"
          color="text.secondary"
          sx={{ px: 4, mb: 2, fontSize: "0.875rem", fontWeight: 500 }}
        >
          {title}
        </Typography>
      )}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderRadius: 1.5,
          overflow: "hidden",
          // `&&` sube la especificidad: sin ella, el `border: 0` de ButtonBase
          // (SettingsRow) se come la línea.
          "&& > * + *": { borderTop: 1, borderColor: "secondary.main" },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default SettingsGroup;
