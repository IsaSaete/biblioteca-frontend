import Box from "@mui/material/Box";
import Brand from "../Brand/Brand";

// Marca centrada, sin enlace ni lema, para pantallas sueltas (404, carga lenta).
const Logo = () => (
  <Box sx={{ display: "flex", justifyContent: "center" }}>
    <Brand tagline={false} />
  </Box>
);

export default Logo;
