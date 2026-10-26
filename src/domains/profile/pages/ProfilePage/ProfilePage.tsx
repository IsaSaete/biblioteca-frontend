import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useLogoutMutation, useMeQuery } from "../../../auth/authApi";
import EditNameDialog from "../../components/EditNameDialog/EditNameDialog";
import SettingsGroup from "../../components/SettingsGroup/SettingsGroup";
import SettingsRow from "../../components/SettingsRow/SettingsRow";
import LibraryViewSelector from "../../components/LibraryViewSelector/LibraryViewSelector";
import ThemeSelector from "../../components/ThemeSelector/ThemeSelector";
import { getInitials } from "../../utils/getInitials";

const LogoutIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
);

const EDIT_NAME_MODAL = "edit-name";

// Índice de cuenta y ajustes (D-032). Solo lo que ya está implementado: las
// demás filas (Cuenta, descargar datos, eliminar cuenta) se añaden con su
// función.
const ProfilePage = () => {
  const navigate = useNavigate();
  const { data } = useMeQuery();
  const [logout, { isLoading }] = useLogoutMutation();
  const [hasFailed, setHasFailed] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const isEditingName = searchParams.get("modal") === EDIT_NAME_MODAL;

  const openEditName = () =>
    setSearchParams((params) => {
      const next = new URLSearchParams(params);
      next.set("modal", EDIT_NAME_MODAL);
      return next;
    });

  const closeModal = () =>
    setSearchParams(
      (params) => {
        const next = new URLSearchParams(params);
        next.delete("modal");
        return next;
      },
      { replace: true },
    );

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
        maxWidth: 480,
        mx: "auto",
        px: 4,
        pt: "calc(env(safe-area-inset-top) + 32px)",
        pb: 8,
        display: "grid",
        gap: 6,
      }}
    >
      <Box sx={{ display: "grid", justifyItems: "center", gap: 3 }}>
        <Avatar
          aria-hidden="true"
          sx={{
            width: 80,
            height: 80,
            fontSize: "1.1875rem",
            bgcolor: "secondary.main",
            color: "secondary.contrastText",
            fontWeight: 500,
          }}
        >
          {data ? getInitials(data.user.name) : ""}
        </Avatar>
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
          label="Nombre"
          value={data?.user.name}
          onClick={openEditName}
        />
        <SettingsRow
          label="Cerrar sesión"
          endIcon={<LogoutIcon />}
          onClick={handleLogout}
          disabled={isLoading}
        />
      </SettingsGroup>

      {hasFailed && (
        <Alert severity="error">
          No se pudo cerrar la sesión. Inténtalo de nuevo.
        </Alert>
      )}
      {isEditingName && data && (
        <EditNameDialog currentName={data.user.name} onClose={closeModal} />
      )}
    </Box>
  );
};

export default ProfilePage;
