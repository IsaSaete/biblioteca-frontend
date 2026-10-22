import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { capitalizeFirst } from "../../utils/capitalizeFirst";
import { formatLabels, provenanceLabels } from "../../utils/ejemplarOptions";
import type { LibraryBook } from "../../dto/LibraryBook";

interface EjemplarDataSectionProps {
  book: LibraryBook;
}

const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);

  return Number.isNaN(date.getTime())
    ? isoDate
    : date.toLocaleDateString("es", { dateStyle: "long", timeZone: "UTC" });
};

// Solo las filas con dato: nunca una fila en blanco.
const getRows = (book: LibraryBook): [string, string][] =>
  (
    [
      ["Ubicación", book.location && capitalizeFirst(book.location)],
      ["Formato", book.format && formatLabels[book.format]],
      ["Procedencia", book.provenance && provenanceLabels[book.provenance]],
      [
        "Fecha de adquisición",
        book.acquisitionDate && formatDate(book.acquisitionDate),
      ],
      ["Notas", book.notes && capitalizeFirst(book.notes)],
    ] as [string, string | undefined][]
  ).filter((row): row is [string, string] => Boolean(row[1]));

// «Datos de tu ejemplar» (HU-21), solo lectura: se editan en el editor único
// de la ficha, junto con los datos del libro.
const EjemplarDataSection = ({ book }: EjemplarDataSectionProps) => {
  const rows = getRows(book);

  return (
    <Box
      component="section"
      aria-labelledby="copy-title"
      sx={{ width: "100%" }}
    >
      <Typography
        id="copy-title"
        component="h2"
        color="text.secondary"
        sx={{ fontSize: "0.875rem" }}
      >
        Datos de tu ejemplar
      </Typography>
      <Box sx={{ mt: 1, bgcolor: "background.paper", borderRadius: 1.5, p: 4 }}>
        {rows.length === 0 ? (
          <Typography color="text.secondary" sx={{ fontSize: "1rem" }}>
            Todavía no has añadido datos de tu ejemplar.
          </Typography>
        ) : (
          <Box component="dl" sx={{ m: 0, display: "grid", gap: 3 }}>
            {rows.map(([label, value]) => (
              <Box key={label}>
                <Typography
                  component="dt"
                  sx={{ fontSize: "0.875rem", fontWeight: 700 }}
                >
                  {label}
                </Typography>
                <Typography
                  component="dd"
                  sx={{ m: 0, fontSize: "1rem", whiteSpace: "pre-line" }}
                >
                  {value}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default EjemplarDataSection;
