import { z } from "zod";
import { isPasswordValid } from "../../utils/passwordRequirements";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

// Se pide el email dos veces: un error al escribirlo dejaría a la persona sin
// poder recuperar su contraseña. La repetición no se envía a la API.
export const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Escribe tu nombre"),
    email: z.email("Escribe un email válido").trim(),
    emailConfirmation: z.string().trim().min(1, "Repite tu email"),
    password: z
      .string()
      .refine(isPasswordValid, "La contraseña no cumple los requisitos"),
    acceptedTerms: z.boolean().refine((value) => value, {
      message: "Debes aceptar los Términos y la Política de Privacidad",
    }),
  })
  .refine(
    ({ email, emailConfirmation }) =>
      normalizeEmail(email) === normalizeEmail(emailConfirmation),
    { message: "Los emails no coinciden", path: ["emailConfirmation"] },
  );

export type RegisterFormValues = z.infer<typeof registerSchema>;
