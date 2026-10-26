import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import BackButton from "../../../../components/ui/BackButton/BackButton";

interface EditScreenProps {
  title: string;
  // Dónde vuelve «Volver» si se entró directamente por el enlace.
  backTo: string;
  children: ReactNode;
}

// Pantalla de detalle de Perfil (sin barra inferior): flecha atrás, título y
// una columna de 480 px, como la ficha del libro.
const EditScreen = ({ title, backTo, children }: EditScreenProps) => (
  <Box
    component="main"
    sx={{ maxWidth: 480, mx: "auto", px: 4, pb: 8, display: "grid", gap: 6 }}
  >
    <Box sx={{ pt: "calc(env(safe-area-inset-top) + 8px)", mx: -2 }}>
      <BackButton fallbackTo={backTo} />
    </Box>
    <Typography variant="h6" component="h1" sx={{ textAlign: "center" }}>
      {title}
    </Typography>
    {children}
  </Box>
);

export default EditScreen;
