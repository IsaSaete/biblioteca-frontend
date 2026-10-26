import { useState } from "react";
import type { ChangeEvent } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import {
  useRemoveAvatarMutation,
  useUploadAvatarMutation,
} from "../../../auth/authApi";
import { getFormErrorMessage } from "../../../auth/utils/getFormErrorMessage";
import { resizeToAvatarJpeg } from "../../utils/avatarImage";
import ProfileAvatar from "../ProfileAvatar/ProfileAvatar";

interface ProfilePhotoProps {
  name: string;
  avatarUrl?: string | null;
}

const actionSx = {
  minHeight: 44,
  px: 3,
  borderRadius: 2,
  fontSize: "0.875rem",
  fontWeight: 500,
};

// Foto de la cuenta con «Cambiar foto» y «Quitar foto» (HU-36). El selector es
// el del sistema, que en el móvil ofrece cámara y galería. La foto se reduce en
// el dispositivo antes de subirla.
const ProfilePhoto = ({ name, avatarUrl }: ProfilePhotoProps) => {
  const [uploadAvatar, { isLoading: isUploading }] = useUploadAvatarMutation();
  const [removeAvatar, { isLoading: isRemoving }] = useRemoveAvatarMutation();
  const [error, setError] = useState<string | null>(null);
  const isBusy = isUploading || isRemoving;

  const handleChoose = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    // Permite elegir la misma foto otra vez después de un fallo.
    input.value = "";

    if (!file) {
      return;
    }

    setError(null);
    let photo: Blob;

    try {
      photo = await resizeToAvatarJpeg(file);
    } catch {
      setError("No se pudo leer la foto. Prueba con otra.");
      return;
    }

    const result = await uploadAvatar(photo);

    if (result.error) {
      setError(
        getFormErrorMessage(
          result.error,
          "No se pudo guardar la foto. Inténtalo de nuevo.",
        ),
      );
    }
  };

  const handleRemove = async () => {
    setError(null);
    const result = await removeAvatar();

    if (result.error) {
      setError(
        getFormErrorMessage(
          result.error,
          "No se pudo quitar la foto. Inténtalo de nuevo.",
        ),
      );
    }
  };

  return (
    <Box sx={{ display: "grid", justifyItems: "center", gap: 2 }}>
      <ProfileAvatar name={name} avatarUrl={avatarUrl} size={96} />
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <ButtonBase
          component="label"
          aria-disabled={isBusy}
          sx={{
            ...actionSx,
            "&:focus-within": {
              outline: "2px solid",
              outlineColor: "primary.main",
            },
          }}
        >
          {isUploading ? "Guardando…" : "Cambiar foto"}
          <input
            type="file"
            accept="image/*"
            disabled={isBusy}
            onChange={(event) => void handleChoose(event)}
            style={{
              position: "absolute",
              width: 1,
              height: 1,
              opacity: 0,
              overflow: "hidden",
            }}
          />
        </ButtonBase>
        {avatarUrl && (
          <ButtonBase
            onClick={() => void handleRemove()}
            disabled={isBusy}
            sx={{ ...actionSx, color: "text.secondary" }}
          >
            {isRemoving ? "Quitando…" : "Quitar foto"}
          </ButtonBase>
        )}
      </Box>
      {error && (
        <Alert severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default ProfilePhoto;
