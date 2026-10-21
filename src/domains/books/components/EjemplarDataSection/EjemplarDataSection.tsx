import { useState } from "react";
import type { FormEvent } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "../../../../components/ui/Button/Button";
import FloatingLabelInput from "../../../../components/ui/FloatingLabelInput/FloatingLabelInput";
import TagsEditor from "../TagsEditor/TagsEditor";
import { getFormErrorMessage } from "../../../auth/utils/getFormErrorMessage";
import { useUpdateEjemplarMutation } from "../../booksApi";
import type { BookFormat } from "../../dto/BookFormat";
import type { BookProvenance } from "../../dto/BookProvenance";
import type { LibraryBook } from "../../dto/LibraryBook";

interface EjemplarDataSectionProps {
  book: LibraryBook;
  tagSuggestions: string[];
}

const formatLabels: Record<BookFormat, string> = {
  hardcover: "Tapa dura",
  paperback: "Tapa blanda",
  pocket: "Bolsillo",
};

const provenanceLabels: Record<BookProvenance, string> = {
  bought: "Comprado",
  gift: "Regalo",
  borrowed: "Prestado",
  inherited: "Heredado",
};

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
      ["Ubicación", book.location],
      ["Formato", book.format && formatLabels[book.format]],
      ["Procedencia", book.provenance && provenanceLabels[book.provenance]],
      [
        "Fecha de adquisición",
        book.acquisitionDate && formatDate(book.acquisitionDate),
      ],
      ["Notas", book.notes],
    ] as [string, string | undefined][]
  ).filter((row): row is [string, string] => Boolean(row[1]));

const isFormat = (value: string): value is BookFormat => value in formatLabels;
const isProvenance = (value: string): value is BookProvenance =>
  value in provenanceLabels;

const selectProps = {
  select: { native: true },
  inputLabel: { shrink: true },
} as const;

// «Datos de tu ejemplar» (HU-21): se leen en el desplegable y un único botón los
// abre a edición. Vaciar un campo lo borra (`null`) en el servidor.
const EjemplarDataSection = ({
  book,
  tagSuggestions,
}: EjemplarDataSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [location, setLocation] = useState("");
  const [format, setFormat] = useState("");
  const [provenance, setProvenance] = useState("");
  const [acquisitionDate, setAcquisitionDate] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [updateEjemplar, { isLoading }] = useUpdateEjemplarMutation();
  const rows = getRows(book);

  const startEditing = () => {
    setLocation(book.location ?? "");
    setFormat(book.format ?? "");
    setProvenance(book.provenance ?? "");
    setAcquisitionDate(book.acquisitionDate ?? "");
    setNotes(book.notes ?? "");
    setTags(book.tags ?? []);
    setFormError(null);
    setIsEditing(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const result = await updateEjemplar({
      bookId: book.id,
      changes: {
        location: location.trim() || null,
        format: isFormat(format) ? format : null,
        provenance: isProvenance(provenance) ? provenance : null,
        acquisitionDate: acquisitionDate || null,
        notes: notes.trim() || null,
        tags,
      },
    });

    if (result.error) {
      setFormError(
        getFormErrorMessage(
          result.error,
          "No se pudieron guardar los datos. Inténtalo de nuevo.",
        ),
      );
      return;
    }

    setIsEditing(false);
  };

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
        sx={{ fontSize: "0.875rem", mb: 3 }}
      >
        Datos de tu ejemplar
      </Typography>
      {isEditing ? (
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit}
          sx={{ display: "grid", gap: 5 }}
        >
          {formError && <Alert severity="error">{formError}</Alert>}
          <FloatingLabelInput
            label="Ubicación"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
          <FloatingLabelInput
            label="Formato"
            value={format}
            onChange={(event) => setFormat(event.target.value)}
            slotProps={selectProps}
            select
          >
            <option value="" />
            {Object.entries(formatLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </FloatingLabelInput>
          <FloatingLabelInput
            label="Procedencia"
            value={provenance}
            onChange={(event) => setProvenance(event.target.value)}
            slotProps={selectProps}
            select
          >
            <option value="" />
            {Object.entries(provenanceLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </FloatingLabelInput>
          <FloatingLabelInput
            label="Fecha de adquisición"
            type="date"
            value={acquisitionDate}
            onChange={(event) => setAcquisitionDate(event.target.value)}
          />
          <FloatingLabelInput
            label="Notas"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            multiline
            minRows={3}
          />
          <TagsEditor
            tags={tags}
            suggestions={tagSuggestions}
            onChange={setTags}
            disabled={isLoading}
          />
          <Box sx={{ display: "grid", gap: 2 }}>
            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? "Guardando…" : "Guardar"}
            </Button>
            <Button
              variant="text"
              fullWidth
              disabled={isLoading}
              onClick={() => setIsEditing(false)}
            >
              Cancelar
            </Button>
          </Box>
        </Box>
      ) : (
        <>
          {rows.length === 0 ? (
            <Typography color="text.secondary" sx={{ fontSize: "1rem", mb: 3 }}>
              Todavía no has añadido datos de tu ejemplar.
            </Typography>
          ) : (
            <Box component="dl" sx={{ m: 0, mb: 3, display: "grid", gap: 3 }}>
              {rows.map(([label, value]) => (
                <Box key={label}>
                  <Typography
                    component="dt"
                    color="text.secondary"
                    sx={{ fontSize: "0.875rem" }}
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
          <Button variant="neutral" onClick={startEditing}>
            {rows.length === 0 && !book.tags?.length
              ? "Añadir datos"
              : "Editar datos"}
          </Button>
        </>
      )}
    </Box>
  );
};

export default EjemplarDataSection;
