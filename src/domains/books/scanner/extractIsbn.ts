import { isValidIsbn } from "../utils/isValidIsbn";

interface DetectedBarcode {
  rawValue: string;
}

// El código de barras de un libro es un EAN-13 que empieza por 978 o 979
// (Bookland) y que coincide con su ISBN-13. Cualquier otro código (un precio,
// el EAN de otro producto cercano) se ignora.
export const extractIsbn = (barcodes: DetectedBarcode[]): string | null => {
  const found = barcodes.find(
    ({ rawValue }) => /^97[89]\d{10}$/.test(rawValue) && isValidIsbn(rawValue),
  );

  return found?.rawValue ?? null;
};
