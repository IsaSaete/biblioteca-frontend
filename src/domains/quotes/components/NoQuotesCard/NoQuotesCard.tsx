import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

// Estado vacío de las citas de un libro, en tarjeta como «Datos de tu ejemplar».
const NoQuotesCard = () => (
  <Box sx={{ bgcolor: "background.paper", borderRadius: 1.5, p: 4 }}>
    <Typography color="text.secondary" sx={{ fontSize: "1rem" }}>
      Todavía no has guardado citas de este libro.
    </Typography>
  </Box>
);

export default NoQuotesCard;
