import type { CreateQuoteRequest } from "../dto/CreateQuoteRequest";
import type { QuoteFormValues } from "./quoteSchema";

// La página vacía no viaja. El origen es `ocr` si el texto salió de la cámara
// (aunque el usuario lo haya corregido) y `manual` si lo escribió a mano.
export const buildCreateQuoteRequest = (
  ejemplarId: string,
  values: QuoteFormValues,
  origin: CreateQuoteRequest["origin"] = "manual",
): CreateQuoteRequest => ({
  ejemplarId,
  text: values.text.trim(),
  ...(values.page.trim() !== "" && { page: Number(values.page) }),
  origin,
});
