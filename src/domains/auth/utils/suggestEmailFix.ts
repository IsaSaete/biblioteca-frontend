// Dominios de correo que más se escriben mal en España. Solo para sugerir: la
// persona puede ignorar el aviso y seguir con lo que escribió.
const COMMON_DOMAINS = [
  "gmail.com",
  "hotmail.com",
  "hotmail.es",
  "outlook.com",
  "outlook.es",
  "yahoo.com",
  "yahoo.es",
  "icloud.com",
  "live.com",
  "msn.com",
  "proton.me",
  "protonmail.com",
];

// Distancia de edición entre dos textos contando como un solo cambio insertar,
// borrar, sustituir o intercambiar dos letras seguidas («gmial» → «gmail»).
const editDistance = (a: string, b: string): number => {
  const rows = a.length + 1;
  const columns = b.length + 1;
  const table: number[][] = Array.from({ length: rows }, (_, i) =>
    Array.from({ length: columns }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < columns; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      table[i][j] = Math.min(
        table[i - 1][j] + 1,
        table[i][j - 1] + 1,
        table[i - 1][j - 1] + cost,
      );

      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        table[i][j] = Math.min(table[i][j], table[i - 2][j - 2] + 1);
      }
    }
  }

  return table[rows - 1][columns - 1];
};

// Si el dominio del correo se parece mucho (un solo error) a uno muy común y no
// es ese, devuelve el correo corregido («ana@gmial.com» → «ana@gmail.com»). Con
// un solo error de diferencia se evita confundir dominios reales distintos.
export const suggestEmailFix = (email: string): string | null => {
  const address = email.trim().toLowerCase();
  const at = address.lastIndexOf("@");

  if (at < 1 || at === address.length - 1) {
    return null;
  }

  const domain = address.slice(at + 1);

  if (COMMON_DOMAINS.includes(domain)) {
    return null;
  }

  const match = COMMON_DOMAINS.find(
    (common) => editDistance(domain, common) === 1,
  );

  return match ? `${address.slice(0, at)}@${match}` : null;
};
