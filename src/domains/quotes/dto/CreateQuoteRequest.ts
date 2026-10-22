// `text` llega ya revisado por el usuario (máx. 5.000 caracteres); `origin`
// por defecto es `manual`. Sin `ejemplarId` la cita no va ligada a ningún libro
// y puede llevar `source` (máx. 120 caracteres).
export interface CreateQuoteRequest {
  ejemplarId?: string;
  text: string;
  page?: number;
  source?: string;
  origin?: "manual" | "ocr";
}
