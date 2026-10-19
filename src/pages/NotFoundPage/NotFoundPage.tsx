import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router";
import Button from "../../components/ui/Button/Button";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      component="main"
      sx={{
        maxWidth: 480,
        mx: "auto",
        px: 4,
        py: 8,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        gap: 2,
      }}
    >
      <Typography variant="h3" component="p" color="primary">
        Glosa
      </Typography>
      <Typography variant="h6" component="h1">
        Página 404 de 403
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 6 }}>
        Este libro se acaba antes. La página que buscas no está en ninguna
        edición.
      </Typography>
      <Button onClick={() => navigate("/")}>Volver al inicio</Button>
    </Box>
  );
};

export default NotFoundPage;
