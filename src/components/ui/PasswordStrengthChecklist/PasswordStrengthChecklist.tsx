import Box from "@mui/material/Box";
import {
  isPasswordValid,
  passwordRequirements,
} from "../../../domains/auth/utils/passwordRequirements";
import { visuallyHidden } from "../../../utils/visuallyHidden";

interface PasswordStrengthChecklistProps {
  password: string;
  isVisible: boolean;
}

const PasswordStrengthChecklist = ({
  password,
  isVisible,
}: PasswordStrengthChecklistProps) => {
  if (!isVisible) {
    return null;
  }

  if (isPasswordValid(password)) {
    return (
      <Box
        role="status"
        sx={{
          fontSize: "0.75rem",
          color: "success.main",
          display: "flex",
          gap: 2,
        }}
      >
        <span aria-hidden="true">✓</span>
        <span>Contraseña segura</span>
      </Box>
    );
  }

  return (
    <Box
      component="ul"
      aria-label="Requisitos de la contraseña"
      sx={{
        listStyle: "none",
        m: 0,
        p: 0,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 1,
      }}
    >
      {passwordRequirements.map((requirement) => {
        const isMet = requirement.isMet(password);

        return (
          <Box
            component="li"
            key={requirement.id}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              fontSize: "0.75rem",
              color: isMet ? "success.main" : "text.secondary",
            }}
          >
            <span aria-hidden="true">{isMet ? "✓" : "○"}</span>
            <span>{requirement.label}</span>
            <Box component="span" sx={visuallyHidden}>
              {isMet ? "(cumplido)" : "(pendiente)"}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default PasswordStrengthChecklist;
