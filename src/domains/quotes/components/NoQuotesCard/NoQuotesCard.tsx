import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface NoQuotesCardProps {
  message?: string;
}

// Estado vacío de las citas (de un libro, o en Inicio), en tarjeta como
// «Datos de tu ejemplar».
const NoQuotesCard = ({
  message = "Todavía no has guardado citas de este libro.",
}: NoQuotesCardProps) => (
  <Box sx={{ bgcolor: "background.paper", borderRadius: 1.5, p: 4 }}>
    <Typography color="text.secondary" sx={{ fontSize: "1rem" }}>
      {message}
    </Typography>
  </Box>
);

export default NoQuotesCard;
