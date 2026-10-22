// `text` llega ya revisado por el usuario (máx. 5.000 caracteres); `origin`
// por defecto es `manual`.
export interface CreateQuoteRequest {
  ejemplarId: string;
  text: string;
  page?: number;
  origin?: "manual" | "ocr";
}
