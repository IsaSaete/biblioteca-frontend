// Tesseract devuelve una línea por cada renglón del libro y deja pasar símbolos
// sueltos del ruido de la foto. Una cita es texto corrido: se unen los
// renglones de cada párrafo, se recomponen las palabras partidas con guion al
// final de línea y se descarta lo que no es texto.
const NOISE_TOKEN = /(^|\s)[|~_^`¦\\]+(?=\s|$)/g;
const HAS_TEXT = /[\p{L}\p{N}]/u;
const HYPHENATED = /(\p{L})-$/u;

const joinLines = (lines: string[]): string =>
  lines.reduce((text, line) => {
    if (!text) {
      return line;
    }

    // «inter-» + «nacional» → «internacional»: solo si sigue en minúscula, para
    // no romper compuestos con nombre propio («franco-Belga»).
    if (HYPHENATED.test(text) && /^\p{Ll}/u.test(line)) {
      return text.slice(0, -1) + line;
    }

    return `${text} ${line}`;
  }, "");

export const normalizeOcrText = (raw: string): string =>
  raw
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map((paragraph) =>
      joinLines(
        paragraph
          .split("\n")
          .map((line) =>
            line.replace(NOISE_TOKEN, "$1").replace(/\s+/g, " ").trim(),
          )
          .filter((line) => HAS_TEXT.test(line)),
      ),
    )
    .filter((paragraph) => paragraph.length > 0)
    .join("\n\n");
