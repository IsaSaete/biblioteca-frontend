import { normalizeIsbn } from "./normalizeIsbn";

const isValidIsbn10 = (isbn: string): boolean => {
  if (!/^\d{9}[\dX]$/.test(isbn)) {
    return false;
  }

  const sum = [...isbn].reduce((total, char, index) => {
    const digit = char === "X" ? 10 : Number(char);
    return total + digit * (10 - index);
  }, 0);

  return sum % 11 === 0;
};

const isValidIsbn13 = (isbn: string): boolean => {
  if (!/^\d{13}$/.test(isbn)) {
    return false;
  }

  const sum = [...isbn].reduce(
    (total, char, index) => total + Number(char) * (index % 2 === 0 ? 1 : 3),
    0,
  );

  return sum % 10 === 0;
};

// Formato y dígito de control, para no gastar una consulta (30/min por
// usuario) con un ISBN que el backend rechazaría con INVALID_ISBN.
export const isValidIsbn = (value: string): boolean => {
  const isbn = normalizeIsbn(value);
  return isValidIsbn10(isbn) || isValidIsbn13(isbn);
};
