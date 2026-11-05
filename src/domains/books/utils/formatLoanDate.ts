// «3 de noviembre» si el préstamo es de este año; con el año si es de otro.
export const formatLoanDate = (
  lentAt: string,
  now: Date = new Date(),
): string => {
  const date = new Date(lentAt);
  const sameYear = date.getFullYear() === now.getFullYear();

  return date.toLocaleDateString(
    "es",
    sameYear ? { day: "numeric", month: "long" } : { dateStyle: "long" },
  );
};
