import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "../../../../components/ui/Button/Button";
import { useMeQuery, useUpdateProfileMutation } from "../../../auth/authApi";
import { getFormErrorMessage } from "../../../auth/utils/getFormErrorMessage";
import { parseApiError } from "../../../auth/utils/parseApiError";
import CardField from "../../components/CardField/CardField";
import EditScreen from "../../components/EditScreen/EditScreen";
import SettingsGroup from "../../components/SettingsGroup/SettingsGroup";
import SettingsRow from "../../components/SettingsRow/SettingsRow";
import { editNameSchema } from "./editNameSchema";
import type { EditNameFormValues } from "./editNameSchema";

interface EditProfileFormProps {
  currentName: string;
  currentEmail: string;
}

const EditProfileForm = ({
  currentName,
  currentEmail,
}: EditProfileFormProps) => {
  const navigate = useNavigate();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register: field,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<EditNameFormValues>({
    resolver: zodResolver(editNameSchema),
    mode: "onSubmit",
    defaultValues: { name: currentName },
  });
  const name = useWatch({ control, name: "name" });
  const hasChanged = name.trim() !== currentName;

  const onSubmit = async (values: EditNameFormValues) => {
    setFormError(null);

    if (values.name === currentName) {
      await navigate("/profile");
      return;
    }

    const result = await updateProfile({ name: values.name });

    if (!result.error) {
      await navigate("/profile");
      return;
    }

    const apiError = parseApiError(result.error);

    if (apiError?.code === "VALIDATION_ERROR" && apiError.field === "name") {
      setError("name", { message: apiError.message });
      return;
    }

    setFormError(
      getFormErrorMessage(
        result.error,
        "No se pudo guardar el nombre. Inténtalo de nuevo.",
      ),
    );
  };

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: "grid", gap: 6 }}
    >
      {formError && <Alert severity="error">{formError}</Alert>}
      <SettingsGroup title="Datos">
        <CardField
          label="Nombre"
          autoComplete="name"
          showEditIcon
          error={errors.name?.message}
          {...field("name")}
        />
      </SettingsGroup>
      <SettingsGroup title="Acceso">
        <SettingsRow
          label="Email"
          value={currentEmail}
          onClick={() => void navigate("/profile/edit/email")}
        />
        <SettingsRow
          label="Contraseña"
          onClick={() => void navigate("/profile/edit/password")}
        />
      </SettingsGroup>
      <Button type="submit" fullWidth disabled={isLoading || !hasChanged}>
        {isLoading ? "Guardando…" : "Guardar"}
      </Button>
    </Box>
  );
};

// Editar el perfil (HU-36): el nombre se cambia aquí; el email y la contraseña,
// que piden la contraseña actual, tienen su propia pantalla.
const EditProfilePage = () => {
  const { data } = useMeQuery();

  return (
    <EditScreen title="Editar perfil" backTo="/profile">
      {data && (
        <EditProfileForm
          currentName={data.user.name}
          currentEmail={data.user.email}
        />
      )}
    </EditScreen>
  );
};

export default EditProfilePage;
