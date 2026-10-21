import MuiButton from "@mui/material/Button";
import type { ButtonProps as MuiButtonProps } from "@mui/material/Button";

interface ButtonProps extends Omit<MuiButtonProps, "variant"> {
  variant?: "primary" | "text" | "neutral";
}

const Button = ({ variant = "primary", sx, ...props }: ButtonProps) => (
  <MuiButton
    variant={variant === "text" ? "text" : "contained"}
    disableElevation
    sx={[
      { minHeight: 44, minWidth: 44, borderRadius: 2 },
      variant === "neutral" && {
        bgcolor: "background.paper",
        color: "text.primary",
        "&:hover": { bgcolor: "action.selected" },
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
    {...props}
  />
);

export default Button;
