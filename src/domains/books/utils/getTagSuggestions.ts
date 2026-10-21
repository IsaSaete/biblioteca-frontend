import type { LibraryBook } from "../dto/LibraryBook";

// Etiquetas que el usuario ya usa en los libros que tiene cargados, de más a
// menos usadas. "Sci-Fi" y "sci-fi" cuentan como la misma (se conserva la primera).
export const getTagSuggestions = (books: LibraryBook[]): string[] => {
  const counts = new Map<string, { tag: string; count: number }>();

  for (const tag of books.flatMap((book) => book.tags ?? [])) {
    const key = tag.toLocaleLowerCase("es");
    const entry = counts.get(key);

    if (entry) {
      entry.count += 1;
    } else {
      counts.set(key, { tag, count: 1 });
    }
  }

  return [...counts.values()]
    .sort((a, b) => b.count - a.count)
    .map(({ tag }) => tag);
};
