import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import type { TextFieldProps } from "@mui/material/TextField";

type FloatingLabelInputProps = Omit<
  TextFieldProps,
  "variant" | "type" | "label"
> & {
  label: string;
  type?: "text" | "email" | "password";
};

const EyeIcon = ({ crossed }: { crossed: boolean }) => (
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
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
    {crossed && <path d="M3 3l18 18" />}
  </svg>
);

const FloatingLabelInput = ({
  type = "text",
  slotProps,
  ...props
}: FloatingLabelInputProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <TextField
      variant="outlined"
      fullWidth
      type={isPassword && isPasswordVisible ? "text" : type}
      slotProps={{
        ...slotProps,
        input: {
          sx: { borderRadius: "6px", minHeight: 44 },
          endAdornment: isPassword ? (
            <InputAdornment position="end">
              <IconButton
                aria-label={
                  isPasswordVisible
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
                onClick={() => setIsPasswordVisible((visible) => !visible)}
                edge="end"
                sx={{ width: 44, height: 44 }}
              >
                <EyeIcon crossed={isPasswordVisible} />
              </IconButton>
            </InputAdornment>
          ) : undefined,
        },
      }}
      {...props}
    />
  );
};

export default FloatingLabelInput;
