import type { LibraryBook } from "../dto/LibraryBook";
import type { UpdateEjemplarRequest } from "../dto/UpdateEjemplarRequest";
import { buildOverridesRequest } from "./buildOverridesRequest";
import { isFormat, isProvenance } from "./ejemplarOptions";
import type { EditBookFormValues } from "./editBookSchema";

const sameList = (a: string[], b: string[]): boolean =>
  a.length === b.length && a.every((item, index) => item === b[index]);

// Un único PATCH con lo que cambió el usuario, tanto de los datos del libro
// (`overrides`) como de los de su ejemplar. Vaciar un dato del ejemplar manda
// `null`, que lo borra en el servidor. `undefined` = nada que guardar.
export const buildEditBookRequest = (
  book: LibraryBook,
  values: EditBookFormValues,
): UpdateEjemplarRequest | undefined => {
  const changes: UpdateEjemplarRequest = {};
  const overrides = buildOverridesRequest(book, values);
  const format = isFormat(values.format) ? values.format : null;
  const provenance = isProvenance(values.provenance) ? values.provenance : null;

  if (overrides) {
    changes.overrides = overrides;
  }
  if (values.location !== (book.location ?? "")) {
    changes.location = values.location || null;
  }
  if (format !== (book.format ?? null)) {
    changes.format = format;
  }
  if (provenance !== (book.provenance ?? null)) {
    changes.provenance = provenance;
  }
  if (values.acquisitionDate !== (book.acquisitionDate ?? "")) {
    changes.acquisitionDate = values.acquisitionDate || null;
  }
  if (values.notes !== (book.notes ?? "")) {
    changes.notes = values.notes || null;
  }
  if (!sameList(values.tags, book.tags ?? [])) {
    changes.tags = values.tags;
  }

  return Object.keys(changes).length > 0 ? changes : undefined;
};
