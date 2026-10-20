import { z } from "zod";

export const parseAuthors = (value: string): string[] =>
  value
    .split(",")
    .map((author) => author.trim())
    .filter((author) => author !== "");

// Mínimo obligatorio de HU-17/HU-18: título, autor y editorial. Año y páginas
// son opcionales, pero si se escriben deben ser números válidos.
export const confirmBookSchema = z.object({
  title: z.string().trim().min(1, "Escribe el título"),
  authors: z
    .string()
    .refine(
      (value) => parseAuthors(value).length > 0,
      "Escribe al menos un autor",
    ),
  publisher: z.string().trim().min(1, "Escribe la editorial"),
  publishedYear: z
    .string()
    .trim()
    .regex(/^(\d{4})?$/, "Escribe un año de 4 cifras"),
  language: z.string().trim(),
  pageCount: z
    .string()
    .trim()
    .regex(/^([1-9]\d{0,4})?$/, "Escribe un número de páginas válido"),
});

export type ConfirmBookFormValues = z.infer<typeof confirmBookSchema>;
