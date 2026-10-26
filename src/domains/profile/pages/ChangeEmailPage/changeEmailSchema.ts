import { z } from "zod";

export const changeEmailSchema = z.object({
  newEmail: z.email("Escribe un email válido").trim(),
  currentPassword: z.string().min(1, "Escribe tu contraseña"),
});

export type ChangeEmailFormValues = z.infer<typeof changeEmailSchema>;
