import { useState } from "react";
import { useNavigate } from "react-router";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { useLogoutMutation, useMeQuery } from "../../../auth/authApi";
import ProfileAvatar from "../../components/ProfileAvatar/ProfileAvatar";
import SettingsGroup from "../../components/SettingsGroup/SettingsGroup";
import SettingsRow from "../../components/SettingsRow/SettingsRow";
import LibraryViewSelector from "../../components/LibraryViewSelector/LibraryViewSelector";
import ThemeSelector from "../../components/ThemeSelector/ThemeSelector";

const PencilIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </svg>
);

// Índice de cuenta y ajustes (D-032). Solo lo que ya está implementado: las
// demás filas (Cuenta, descargar datos, eliminar cuenta) se añaden con su
// función.
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
      sx={{
        position: "relative",
        maxWidth: 480,
        mx: "auto",
        px: 4,
        pt: "calc(env(safe-area-inset-top) + 32px)",
        pb: 8,
        display: "grid",
        gap: 6,
      }}
    >
      {data && (
        <IconButton
          aria-label="Editar perfil"
          title="Editar perfil"
          onClick={() => void navigate("/profile/edit")}
          sx={{
            position: "absolute",
            top: "calc(env(safe-area-inset-top) + 8px)",
            right: 8,
            width: 44,
            height: 44,
            color: "text.secondary",
          }}
        >
          <PencilIcon />
        </IconButton>
      )}
      <Box sx={{ display: "grid", justifyItems: "center", gap: 3 }}>
        <ProfileAvatar
          name={data?.user.name ?? ""}
          avatarUrl={data?.user.avatarUrl}
          size={80}
        />
        <Box sx={{ minWidth: 0, maxWidth: "100%", textAlign: "center" }}>
          <Typography variant="h6" component="h1" noWrap>
            {data?.user.name}
          </Typography>
          <Typography
            color="text.secondary"
            noWrap
            sx={{ fontSize: "0.8125rem" }}
          >
            {data?.user.email}
          </Typography>
        </Box>
      </Box>

      <SettingsGroup title="Preferencias">
        <LibraryViewSelector />
        <ThemeSelector />
      </SettingsGroup>

      <SettingsGroup title="Privacidad y datos">
        <SettingsRow label="Política de privacidad" to="/privacy" />
        <SettingsRow label="Términos de uso" to="/terms" />
      </SettingsGroup>

      <SettingsGroup title="Cuenta">
        <SettingsRow
          label="Cerrar sesión"
          isAction
          onClick={handleLogout}
          disabled={isLoading}
        />
      </SettingsGroup>

      {hasFailed && (
        <Alert severity="error">
          No se pudo cerrar la sesión. Inténtalo de nuevo.
        </Alert>
      )}
    </Box>
  );
};

export default ProfilePage;
