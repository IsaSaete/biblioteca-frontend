import { useState } from "react";
import { useNavigate } from "react-router";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "../../../../components/ui/Button/Button";
import { useLogoutMutation, useMeQuery } from "../../../auth/authApi";
import ThemeSelector from "../../components/ThemeSelector/ThemeSelector";
import { getInitials } from "../../utils/getInitials";

// Solo lo que ya está implementado: tema, cuenta y cerrar sesión (HU-40). La vista
// de biblioteca, privacidad y eliminar cuenta se añaden cuando existan.
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
      sx={{ maxWidth: 480, mx: "auto", px: 4, py: 8, display: "grid", gap: 6 }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
        <Avatar
          aria-hidden="true"
          sx={{
            width: 56,
            height: 56,
            bgcolor: "secondary.main",
            color: "secondary.contrastText",
            fontWeight: 500,
          }}
        >
          {data ? getInitials(data.user.name) : ""}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" component="h1" noWrap>
            {data?.user.name}
          </Typography>
          <Typography color="text.secondary" noWrap>
            {data?.user.email}
          </Typography>
        </Box>
      </Box>

      <Box component="section" aria-labelledby="preferences-title">
        <Typography
          id="preferences-title"
          component="h2"
          variant="caption"
          color="text.secondary"
          sx={{ px: 2, display: "block" }}
        >
          Preferencias
        </Typography>
        <ThemeSelector />
      </Box>

      {hasFailed && (
        <Alert severity="error">
          No se pudo cerrar la sesión. Inténtalo de nuevo.
        </Alert>
      )}

      <Button variant="text" onClick={handleLogout} disabled={isLoading}>
        Cerrar sesión
      </Button>
    </Box>
  );
};

export default ProfilePage;
