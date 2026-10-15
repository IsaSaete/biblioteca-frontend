import MuiButton from "@mui/material/Button";
import type { ButtonProps as MuiButtonProps } from "@mui/material/Button";

interface ButtonProps extends Omit<MuiButtonProps, "variant"> {
  variant?: "primary" | "text";
}

const Button = ({ variant = "primary", sx, ...props }: ButtonProps) => (
  <MuiButton
    variant={variant === "primary" ? "contained" : "text"}
    disableElevation
    sx={[
      { minHeight: 44, minWidth: 44, borderRadius: 2 },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
    {...props}
  />
);

export default Button;
