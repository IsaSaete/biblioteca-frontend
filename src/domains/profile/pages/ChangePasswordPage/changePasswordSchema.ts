import { z } from "zod";
import { isPasswordValid } from "../../../auth/utils/passwordRequirements";

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Escribe tu contraseña actual"),
  newPassword: z
    .string()
    .refine(isPasswordValid, "La contraseña no cumple los requisitos"),
});

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
