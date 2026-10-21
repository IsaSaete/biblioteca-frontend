import { z } from "zod";
import { confirmBookSchema } from "./confirmBookSchema";

// Los mismos mínimos que al añadir el libro, más sinopsis y géneros (separados
// por comas, como los autores).
export const editBookSchema = confirmBookSchema.extend({
  synopsis: z.string().trim(),
  categories: z.string(),
});

export type EditBookFormValues = z.infer<typeof editBookSchema>;
