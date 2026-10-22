import { z } from "zod";
import { confirmBookSchema } from "./confirmBookSchema";

// Los mismos mínimos que al añadir el libro, más sinopsis y géneros (separados
// por comas, como los autores).
export const bookDataSchema = confirmBookSchema.extend({
  synopsis: z.string().trim(),
  categories: z.string(),
});

// Editor único: los datos del libro (correcciones personales) y los de tu
// ejemplar. Formato y procedencia vacíos = sin dato.
export const editBookSchema = bookDataSchema.extend({
  location: z.string().trim(),
  format: z.string(),
  provenance: z.string(),
  acquisitionDate: z.string(),
  notes: z.string().trim(),
  tags: z.array(z.string()),
});

export type BookDataFormValues = z.infer<typeof bookDataSchema>;
export type EditBookFormValues = z.infer<typeof editBookSchema>;
