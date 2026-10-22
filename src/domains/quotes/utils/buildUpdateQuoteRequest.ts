import type { Quote } from "../dto/Quote";
import type { UpdateQuoteRequest } from "../dto/UpdateQuoteRequest";
import type { QuoteFormValues } from "./quoteSchema";

// Solo viaja lo que el usuario cambió; vaciar la página o la fuente manda
// `null` (la borra). La fuente solo se considera en citas sin libro.
// `undefined` = nada que guardar.
export const buildUpdateQuoteRequest = (
  quote: Quote,
  values: QuoteFormValues,
): UpdateQuoteRequest | undefined => {
  const changes: UpdateQuoteRequest = {};
  const text = values.text.trim();
  const page = values.page.trim() === "" ? null : Number(values.page);
  const source = values.source.trim() === "" ? null : values.source.trim();

  if (text !== quote.text) {
    changes.text = text;
  }
  if (page !== (quote.page ?? null)) {
    changes.page = page;
  }
  if (!quote.book && source !== (quote.source ?? null)) {
    changes.source = source;
  }

  return Object.keys(changes).length > 0 ? changes : undefined;
};
