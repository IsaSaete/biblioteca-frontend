import { isDetailField, isRequiredField } from "./confirmBookFields";

// Un error en un campo que no se ve (edición cerrada o detalles plegados) se
// enseña abriendo lo que lo contiene.
export const getSectionsToReveal = (
  failedFields: readonly string[],
): { editing: boolean; details: boolean } => ({
  editing: failedFields.some(isRequiredField),
  details: failedFields.some(isDetailField),
});
