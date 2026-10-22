import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import Button from "../../../../components/ui/Button/Button";
import FloatingLabelInput from "../../../../components/ui/FloatingLabelInput/FloatingLabelInput";
import FullScreenModal from "../../../../components/ui/FullScreenModal/FullScreenModal";
import { getFormErrorMessage } from "../../../auth/utils/getFormErrorMessage";
import { parseApiError } from "../../../auth/utils/parseApiError";
import { useFieldValidation } from "../../../auth/hooks/useFieldValidation";
import { useUpdateEjemplarMutation } from "../../booksApi";
import type { LibraryBook } from "../../dto/LibraryBook";
import { buildEditBookRequest } from "../../utils/buildEditBookRequest";
import { formatLabels, provenanceLabels } from "../../utils/ejemplarOptions";
import TagsEditor from "../TagsEditor/TagsEditor";
import { editBookSchema } from "../../utils/editBookSchema";
import type { EditBookFormValues } from "../../utils/editBookSchema";

interface EditBookDialogProps {
  book: LibraryBook;
  tagSuggestions: string[];
  onClose: () => void;
}

const TITLE_ID = "edit-book-title";

const fieldNames: (keyof EditBookFormValues)[] = [
  "title",
  "authors",
  "publisher",
  "publishedYear",
  "language",
  "pageCount",
  "synopsis",
  "categories",
  "location",
  "format",
  "provenance",
  "acquisitionDate",
  "notes",
  "tags",
];

const selectProps = {
  select: { native: true },
  inputLabel: { shrink: true },
} as const;

// Dos campos cortos comparten fila (también en móvil).
const pairSx = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 };

const fieldsetSx = { display: "grid", gap: 5, border: 0, m: 0, p: 0 };
const legendSx = { fontSize: "0.875rem", fontWeight: 700, mb: 4, p: 0 };

const getDefaultValues = (book: LibraryBook): EditBookFormValues => ({
  title: book.title,
  authors: book.authors.join(", "),
  publisher: book.publisher,
  publishedYear: book.publishedYear?.toString() ?? "",
  language: book.language ?? "",
  pageCount: book.pageCount?.toString() ?? "",
  synopsis: book.synopsis ?? "",
  categories: book.categories?.join(", ") ?? "",
  location: book.location ?? "",
  format: book.format ?? "",
  provenance: book.provenance ?? "",
  acquisitionDate: book.acquisitionDate ?? "",
  notes: book.notes ?? "",
  tags: book.tags ?? [],
});

// Editor único (HU-21, HU-22) con dos secciones y un solo «Guardar»: los datos
// del libro se guardan como override en el ejemplar, nunca en el libro
// compartido (modelo-de-datos.md), y vaciar un campo opcional quita la
// corrección; los datos del ejemplar y las etiquetas van en el mismo PATCH.
const EditBookDialog = ({
  book,
  tagSuggestions,
  onClose,
}: EditBookDialogProps) => {
  const form = useForm<EditBookFormValues>({
    resolver: zodResolver(editBookSchema),
    defaultValues: getDefaultValues(book),
  });
  const {
    register: field,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = form;
  const validationHandlers = useFieldValidation(form);
  const [formError, setFormError] = useState<string | null>(null);
  const [updateEjemplar, { isLoading }] = useUpdateEjemplarMutation();

  const onSubmit = async (values: EditBookFormValues) => {
    setFormError(null);
    const changes = buildEditBookRequest(book, values);

    if (!changes) {
      onClose();
      return;
    }

    const result = await updateEjemplar({ bookId: book.id, changes });

    if (!result.error) {
      onClose();
      return;
    }

    const apiError = parseApiError(result.error);
    const apiField = apiError?.field?.replace(/^overrides\./, "");
    const name = fieldNames.find((fieldName) => fieldName === apiField);

    if (apiError?.code === "VALIDATION_ERROR" && name) {
      setError(name, { message: apiError.message });
      return;
    }

    setFormError(
      getFormErrorMessage(
        result.error,
        "No se pudieron guardar los datos. Inténtalo de nuevo.",
      ),
    );
  };

  return (
    <FullScreenModal titleId={TITLE_ID} onClose={onClose}>
      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        sx={{ display: "grid", gap: 5, pt: 4 }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Typography id={TITLE_ID} variant="h6" component="h2">
            Edita tu libro
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Los cambios solo afectan a tu biblioteca. Si vacías un dato opcional
            del libro, vuelve el original.
          </Typography>
        </Box>
        {formError && <Alert severity="error">{formError}</Alert>}
        <Box component="fieldset" sx={fieldsetSx}>
          <Typography component="legend" sx={legendSx}>
            Datos del libro
          </Typography>
          <FloatingLabelInput
            label="Título"
            error={!!errors.title}
            helperText={errors.title?.message}
            {...field("title", validationHandlers("title"))}
          />
          <FloatingLabelInput
            label="Autores"
            error={!!errors.authors}
            helperText={
              errors.authors?.message ?? "Separa varios autores con comas."
            }
            {...field("authors", validationHandlers("authors"))}
          />
          <FloatingLabelInput
            label="Editorial"
            error={!!errors.publisher}
            helperText={errors.publisher?.message}
            {...field("publisher", validationHandlers("publisher"))}
          />
          <Box sx={pairSx}>
            <FloatingLabelInput
              label="Año"
              error={!!errors.publishedYear}
              helperText={errors.publishedYear?.message}
              slotProps={{ htmlInput: { inputMode: "numeric" } }}
              {...field("publishedYear", validationHandlers("publishedYear"))}
            />
            <FloatingLabelInput
              label="Páginas"
              error={!!errors.pageCount}
              helperText={errors.pageCount?.message}
              slotProps={{ htmlInput: { inputMode: "numeric" } }}
              {...field("pageCount", validationHandlers("pageCount"))}
            />
          </Box>
          <FloatingLabelInput label="Idioma" {...field("language")} />
          <FloatingLabelInput
            label="Géneros"
            helperText="Separa varios géneros con comas."
            {...field("categories")}
          />
          <FloatingLabelInput
            label="Sinopsis"
            multiline
            minRows={4}
            {...field("synopsis")}
          />
        </Box>
        <Box component="fieldset" sx={fieldsetSx}>
          <Typography component="legend" sx={legendSx}>
            Datos de tu ejemplar
          </Typography>
          <FloatingLabelInput label="Ubicación" {...field("location")} />
          <Box sx={pairSx}>
            <FloatingLabelInput
              label="Formato"
              slotProps={selectProps}
              select
              {...field("format")}
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
              slotProps={selectProps}
              select
              {...field("provenance")}
            >
              <option value="" />
              {Object.entries(provenanceLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </FloatingLabelInput>
          </Box>
          <FloatingLabelInput
            label="Fecha de adquisición"
            type="date"
            {...field("acquisitionDate")}
          />
          <FloatingLabelInput
            label="Notas"
            multiline
            minRows={3}
            {...field("notes")}
          />
          <Controller
            control={control}
            name="tags"
            render={({ field: { value, onChange } }) => (
              <TagsEditor
                tags={value}
                suggestions={tagSuggestions}
                onChange={onChange}
                disabled={isLoading}
              />
            )}
          />
        </Box>
        <Box sx={{ display: "grid", gap: 2 }}>
          <Button type="submit" fullWidth disabled={isLoading}>
            {isLoading ? "Guardando…" : "Guardar"}
          </Button>
          <Button
            variant="text"
            fullWidth
            disabled={isLoading}
            onClick={onClose}
          >
            Cancelar
          </Button>
        </Box>
      </Box>
    </FullScreenModal>
  );
};

export default EditBookDialog;
