import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Button from "../../../../components/ui/Button/Button";
import FloatingLabelInput from "../../../../components/ui/FloatingLabelInput/FloatingLabelInput";
import FullScreenModal from "../../../../components/ui/FullScreenModal/FullScreenModal";
import { getFormErrorMessage } from "../../../auth/utils/getFormErrorMessage";
import { parseApiError } from "../../../auth/utils/parseApiError";
import { useFieldValidation } from "../../../auth/hooks/useFieldValidation";
import { useUpdateEjemplarMutation } from "../../booksApi";
import type { LibraryBook } from "../../dto/LibraryBook";
import { buildOverridesRequest } from "../../utils/buildOverridesRequest";
import { editBookSchema } from "../../utils/editBookSchema";
import type { EditBookFormValues } from "../../utils/editBookSchema";

interface EditBookDialogProps {
  book: LibraryBook;
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
];

const getDefaultValues = (book: LibraryBook): EditBookFormValues => ({
  title: book.title,
  authors: book.authors.join(", "),
  publisher: book.publisher,
  publishedYear: book.publishedYear?.toString() ?? "",
  language: book.language ?? "",
  pageCount: book.pageCount?.toString() ?? "",
  synopsis: book.synopsis ?? "",
  categories: book.categories?.join(", ") ?? "",
});

// Corrección personal de los datos del libro (HU-21): se guarda como override
// en el ejemplar, nunca en el libro compartido (modelo-de-datos.md). Vaciar un
// campo opcional quita la corrección y vuelve a verse el dato original.
const EditBookDialog = ({ book, onClose }: EditBookDialogProps) => {
  const form = useForm<EditBookFormValues>({
    resolver: zodResolver(editBookSchema),
    defaultValues: getDefaultValues(book),
  });
  const {
    register: field,
    handleSubmit,
    setError,
    formState: { errors },
  } = form;
  const validationHandlers = useFieldValidation(form);
  const [formError, setFormError] = useState<string | null>(null);
  const [updateEjemplar, { isLoading }] = useUpdateEjemplarMutation();

  const onSubmit = async (values: EditBookFormValues) => {
    setFormError(null);
    const overrides = buildOverridesRequest(book, values);

    if (!overrides) {
      onClose();
      return;
    }

    const result = await updateEjemplar({
      bookId: book.id,
      changes: { overrides },
    });

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
            Edita los datos del libro
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Solo cambian en tu biblioteca. Si vacías un dato opcional, vuelve el
            original.
          </Typography>
        </Box>
        {formError && <Alert severity="error">{formError}</Alert>}
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
        <FloatingLabelInput
          label="Año de publicación"
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
