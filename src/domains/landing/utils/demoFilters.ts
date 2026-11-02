import type { DemoBook, DemoFilterId } from "../content/demoLibrary";

export const matchesFilter = (book: DemoBook, filter: DemoFilterId): boolean =>
  filter === "todos" || book.tags.includes(filter);

export const countBooks = (count: number): string =>
  `${count} ${count === 1 ? "libro" : "libros"}`;
