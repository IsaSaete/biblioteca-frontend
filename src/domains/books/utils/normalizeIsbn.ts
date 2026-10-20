// Quita guiones y espacios; la `x` final del ISBN-10 se pasa a mayúscula.
export const normalizeIsbn = (value: string): string =>
  value.replace(/[\s-]/g, "").toUpperCase();
