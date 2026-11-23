const languageNames = new Intl.DisplayNames(["es"], { type: "language" });

const capitalize = (text: string): string =>
  text.charAt(0).toLocaleUpperCase("es") + text.slice(1);

// Nombre del idioma si el texto es un código que el navegador conoce («es»,
// «eng»); si no, nada.
const getKnownName = (text: string): string | undefined => {
  try {
    const name = languageNames.of(text);

    return name && name.toLowerCase() !== text.toLowerCase() ? name : undefined;
  } catch {
    return undefined;
  }
};

// Cómo se enseña el idioma de un libro, venga de la API (códigos como «es») o
// lo haya escrito la persona. Un código conocido se traduce a su nombre
// («es» → «Español»); un texto libre de hasta 3 letras va en mayúsculas
// («esp» → «ESP») y el resto con la inicial en mayúscula («español» →
// «Español»).
export const formatLanguage = (language: string): string => {
  const text = language.trim();

  if (text === "") {
    return "";
  }

  const knownName = getKnownName(text);

  if (knownName) {
    return capitalize(knownName);
  }

  return text.length <= 3 ? text.toLocaleUpperCase("es") : capitalize(text);
};
