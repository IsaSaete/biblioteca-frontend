import type { ConfirmBookFormValues } from "../../utils/confirmBookSchema";

export type ConfirmBookField = keyof ConfirmBookFormValues;

// Los que se ven siempre que se edita, y los plegados en «Más detalles».
export const requiredFields = ["title", "authors", "publisher"] as const;
export const detailFields = ["publishedYear", "language", "pageCount"] as const;

const includes = (names: readonly string[], name: string): boolean =>
  names.includes(name);

export const isRequiredField = (name: string): boolean =>
  includes(requiredFields, name);

export const isDetailField = (name: string): boolean =>
  includes(detailFields, name);

export const isConfirmBookField = (name: string): name is ConfirmBookField =>
  isRequiredField(name) || isDetailField(name);
