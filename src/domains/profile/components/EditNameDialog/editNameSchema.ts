import { z } from "zod";

// Las mismas reglas que el backend (`PATCH /auth/me`).
export const editNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Escribe tu nombre")
    .max(80, "El nombre no puede superar los 80 caracteres"),
});

export type EditNameFormValues = z.infer<typeof editNameSchema>;
