import type { CreateQuoteRequest } from "../dto/CreateQuoteRequest";
import type { QuoteFormValues } from "./quoteSchema";

// La página vacía no viaja; el origen de una cita escrita a mano es `manual`.
export const buildCreateQuoteRequest = (
  ejemplarId: string,
  values: QuoteFormValues,
): CreateQuoteRequest => ({
  ejemplarId,
  text: values.text.trim(),
  ...(values.page.trim() !== "" && { page: Number(values.page) }),
  origin: "manual",
});
