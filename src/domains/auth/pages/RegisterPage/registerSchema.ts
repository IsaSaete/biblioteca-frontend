import { z } from "zod";
import { isPasswordValid } from "../../utils/passwordRequirements";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Escribe tu nombre"),
  email: z.email("Escribe un email válido").trim(),
  password: z
    .string()
    .refine(isPasswordValid, "La contraseña no cumple los requisitos"),
  acceptedTerms: z.boolean().refine((value) => value, {
    message: "Debes aceptar los Términos y la Política de Privacidad",
  }),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
