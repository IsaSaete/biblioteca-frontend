import { useId } from "react";
import type { ComponentProps } from "react";
import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import Typography from "@mui/material/Typography";

type CardFieldProps = Omit<ComponentProps<typeof InputBase>, "error"> & {
  label: string;
  // Mensaje de error del campo; si lo hay, se asocia al campo para los lectores
  // de pantalla.
  error?: string;
  type?: "text" | "email";
  // Lápiz al final del campo: avisa de que el valor se edita aquí mismo, sin
  // abrir otra pantalla (las filas con chevron sí la abren).
  showEditIcon?: boolean;
};

const PencilIcon = () => (
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
    <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </svg>
);

// Campo de formulario para ir dentro de un `SettingsGroup`: etiqueta pequeña
// encima y valor debajo, sin contorno. La tarjeta pone el fondo y las líneas.
const CardField = ({
  label,
  error,
  type = "text",
  showEditIcon = false,
  sx,
  ...props
}: CardFieldProps) => {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <Box sx={{ px: 4, py: 3 }}>
      <Typography
        component="label"
        htmlFor={id}
        color="text.secondary"
        sx={{ display: "block", fontSize: "0.75rem" }}
      >
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <InputBase
          id={id}
          type={type}
          fullWidth
          error={!!error}
          inputProps={{
            "aria-invalid": !!error,
            "aria-describedby": error ? errorId : undefined,
          }}
          sx={[
            { minHeight: 32, fontSize: "1rem" },
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
          {...props}
        />
        {showEditIcon && (
          <Box
            component="span"
            sx={{ display: "flex", color: "text.secondary", flexShrink: 0 }}
          >
            <PencilIcon />
          </Box>
        )}
      </Box>
      {error && (
        <Typography
          id={errorId}
          color="error"
          sx={{ mt: 1, fontSize: "0.75rem" }}
        >
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default CardField;
