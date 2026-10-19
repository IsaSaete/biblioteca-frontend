import { z } from "zod";
import { isPasswordValid } from "../../utils/passwordRequirements";

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .refine(isPasswordValid, "La contraseña no cumple los requisitos"),
});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
