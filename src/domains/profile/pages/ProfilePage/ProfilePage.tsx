import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Button from "../../../../components/ui/Button/Button";
import { useLogoutMutation, useMeQuery } from "../../../auth/authApi";

// Provisional: solo lo que ya está implementado (cuenta y cerrar sesión, HU-40).
// El resto de opciones del Perfil se añade cuando existan.
const ProfilePage = () => {
  const navigate = useNavigate();
  const { data } = useMeQuery();
  const [logout, { isLoading }] = useLogoutMutation();
  const [hasFailed, setHasFailed] = useState(false);

  const handleLogout = async () => {
    setHasFailed(false);

    try {
      await logout().unwrap();
      await navigate("/login", { replace: true });
    } catch {
      setHasFailed(true);
    }
  };

  return (
    <Box
      component="main"
      sx={{ maxWidth: 480, mx: "auto", px: 4, py: 8, display: "grid", gap: 4 }}
    >
      <Box>
        <Typography variant="h6" component="h1">
          {data?.user.name}
        </Typography>
        <Typography color="text.secondary">{data?.user.email}</Typography>
      </Box>

      {hasFailed && (
        <Alert severity="error">
          No se pudo cerrar la sesión. Inténtalo de nuevo.
        </Alert>
      )}

      <Button variant="text" onClick={handleLogout} disabled={isLoading}>
        Cerrar sesión
      </Button>

      <Link component={RouterLink} to="/library">
        Biblioteca
      </Link>
    </Box>
  );
};

export default ProfilePage;
