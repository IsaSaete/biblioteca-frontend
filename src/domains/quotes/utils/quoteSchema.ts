import { z } from "zod";

export const MAX_QUOTE_LENGTH = 5000;

// `text` obligatorio y de hasta 5.000 caracteres; `page` es opcional, pero si
// se escribe debe ser un entero positivo (api-contract.md, `quotes`).
export const quoteSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Escribe la cita")
    .max(MAX_QUOTE_LENGTH, `Máximo ${MAX_QUOTE_LENGTH} caracteres`),
  page: z
    .string()
    .trim()
    .regex(/^([1-9]\d{0,4})?$/, "Escribe un número de página válido"),
});

export type QuoteFormValues = z.infer<typeof quoteSchema>;
