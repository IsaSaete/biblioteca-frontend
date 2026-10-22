import type { CreateQuoteRequest } from "../dto/CreateQuoteRequest";
import type { QuoteFormValues } from "./quoteSchema";

// La página vacía no viaja. El origen es `ocr` si el texto salió de la cámara
// (aunque el usuario lo haya corregido) y `manual` si lo escribió a mano. Sin
// `ejemplarId` la cita no tiene libro y puede llevar su fuente; con él, nunca.
export const buildCreateQuoteRequest = (
  ejemplarId: string | undefined,
  values: QuoteFormValues,
  origin: CreateQuoteRequest["origin"] = "manual",
): CreateQuoteRequest => ({
  ...(ejemplarId !== undefined && { ejemplarId }),
  text: values.text.trim(),
  ...(values.page.trim() !== "" && { page: Number(values.page) }),
  ...(ejemplarId === undefined &&
    values.source.trim() !== "" && { source: values.source.trim() }),
  origin,
});
