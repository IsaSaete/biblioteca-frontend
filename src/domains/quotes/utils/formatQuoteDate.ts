// «12 nov 2026», en la zona horaria de quien la mira. Vacío si la fecha no es
// válida.
export const formatQuoteDate = (isoDate: string): string => {
  const date = new Date(isoDate);

  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("es", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};
