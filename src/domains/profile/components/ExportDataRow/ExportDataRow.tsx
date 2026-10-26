import { useState } from "react";
import Typography from "@mui/material/Typography";
import { useExportDataMutation } from "../../../auth/authApi";
import { getFormErrorMessage } from "../../../auth/utils/getFormErrorMessage";
import { downloadBlob } from "../../utils/downloadBlob";
import SettingsRow from "../SettingsRow/SettingsRow";

const FILENAME = "glosa-datos.json";

const DownloadIcon = () => (
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
    <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
  </svg>
);

// «Descargar mis datos» (HU-38, RGPD): pide todos los datos de la cuenta y los
// guarda como un archivo JSON en el dispositivo.
const ExportDataRow = () => {
  const [exportData, { isLoading }] = useExportDataMutation();
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setError(null);
    const result = await exportData();

    if (result.error) {
      setError(
        getFormErrorMessage(
          result.error,
          "No se pudieron descargar tus datos. Inténtalo de nuevo.",
        ),
      );
      return;
    }

    downloadBlob(result.data, FILENAME);
  };

  return (
    <>
      <SettingsRow
        label="Descargar mis datos"
        value={isLoading ? "Preparando…" : undefined}
        endIcon={isLoading ? undefined : <DownloadIcon />}
        onClick={() => void handleClick()}
        disabled={isLoading}
      />
      {error && (
        <Typography
          role="alert"
          color="error"
          sx={{ px: 4, py: 3, fontSize: "0.875rem" }}
        >
          {error}
        </Typography>
      )}
    </>
  );
};

export default ExportDataRow;
