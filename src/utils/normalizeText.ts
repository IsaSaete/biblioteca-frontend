// Para comparar textos sin distinguir mayúsculas ni tildes («Poesía» = «poesia»).
export const normalizeText = (text: string): string =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("es");
