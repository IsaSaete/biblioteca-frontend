import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Accordion from "../../../../components/ui/Accordion/Accordion";
import Button from "../../../../components/ui/Button/Button";
import FloatingLabelInput from "../../../../components/ui/FloatingLabelInput/FloatingLabelInput";
import Pill from "../../../../components/ui/Pill/Pill";
import { parseApiError } from "../../../auth/utils/parseApiError";
import { getFormErrorMessage } from "../../../auth/utils/getFormErrorMessage";
import { useFieldValidation } from "../../../auth/hooks/useFieldValidation";
import { useCreateBookMutation } from "../../booksApi";
import type { BookStatus } from "../../dto/BookStatus";
import type { ExternalBook } from "../../dto/ExternalBook";
import { buildCreateBookRequest } from "../../utils/buildCreateBookRequest";
import { confirmBookSchema } from "../../utils/confirmBookSchema";
import type { ConfirmBookFormValues } from "../../utils/confirmBookSchema";
import BookCover from "../BookCover/BookCover";

interface ConfirmBookStepProps {
  book: ExternalBook;
  onSaved: () => void;
}

const statusOptions: { value: BookStatus; label: string }[] = [
  { value: "pending", label: "Pendiente" },
  { value: "reading", label: "Leyendo" },
  { value: "read", label: "Leído" },
];

const detailFields = ["publishedYear", "language", "pageCount"] as const;
const requiredFields = ["title", "authors", "publisher"] as const;

const PencilIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </svg>
);

const getDefaultValues = (book: ExternalBook): ConfirmBookFormValues => ({
  title: book.title,
  authors: book.authors.join(", "),
  publisher: book.publisher ?? "",
  publishedYear: book.publishedYear?.toString() ?? "",
  language: book.language ?? "",
  pageCount: book.pageCount?.toString() ?? "",
});

// «Confirma los datos» (HU-18) y estado de lectura (HU-19): los datos se ven
// como texto y un único lápiz los abre a edición. La editorial es obligatoria
// al guardar y los proveedores a menudo no la dan, así que sin ella se pide ya
// en modo edición.
const ConfirmBookStep = ({ book, onSaved }: ConfirmBookStepProps) => {
  const form = useForm<ConfirmBookFormValues>({
    resolver: zodResolver(confirmBookSchema),
    defaultValues: getDefaultValues(book),
  });
  const {
    register: field,
    handleSubmit,
    getValues,
    setError,
    formState: { errors },
  } = form;
  const validationHandlers = useFieldValidation(form);
  const [isEditing, setIsEditing] = useState(!book.publisher);
  const [areDetailsExpanded, setAreDetailsExpanded] = useState(false);
  const [status, setStatus] = useState<BookStatus>("pending");
  const [formError, setFormError] = useState<string | null>(null);
  const [createBook, { isLoading }] = useCreateBookMutation();

  const onSubmit = async (values: ConfirmBookFormValues) => {
    setFormError(null);
    const result = await createBook(
      buildCreateBookRequest(book, values, status),
    );

    if (!result.error) {
      onSaved();
      return;
    }

    const apiError = parseApiError(result.error);

    if (apiError?.code === "BOOK_ALREADY_IN_LIBRARY") {
      setFormError("Este libro ya está en tu biblioteca.");
      return;
    }

    const apiField = apiError?.field;

    if (
      apiError?.code === "VALIDATION_ERROR" &&
      apiField !== undefined &&
      [...requiredFields, ...detailFields].some((name) => name === apiField)
    ) {
      const name = apiField as keyof ConfirmBookFormValues;
      setError(name, { message: apiError.message });
      setIsEditing(true);
      setAreDetailsExpanded(
        (expanded) => expanded || detailFields.some((d) => d === name),
      );
      return;
    }

    setFormError(
      getFormErrorMessage(
        result.error,
        "No se pudo guardar el libro. Inténtalo de nuevo.",
      ),
    );
  };

  // Un error en un campo oculto (edición cerrada o detalles plegados) se
  // enseña abriendo lo que lo contiene.
  const onInvalid = () => {
    const failed = Object.keys(form.formState.errors);
    if (requiredFields.some((name) => failed.includes(name))) {
      setIsEditing(true);
    }
    if (detailFields.some((name) => failed.includes(name))) {
      setAreDetailsExpanded(true);
    }
  };

  const values = getValues();

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      sx={{ display: "grid", gap: 5 }}
    >
      {formError && <Alert severity="error">{formError}</Alert>}

      <Box sx={{ width: 120, justifySelf: "center" }}>
        <BookCover title={values.title} coverUrl={book.coverUrl} />
      </Box>

      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
        {isEditing ? (
          <Box sx={{ flex: 1, display: "grid", gap: 5 }}>
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
          </Box>
        ) : (
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" component="p">
              {values.title}
            </Typography>
            <Typography color="text.secondary">{values.authors}</Typography>
            <Typography color="text.secondary">{values.publisher}</Typography>
          </Box>
        )}
        <IconButton
          aria-label="Editar datos del libro"
          aria-pressed={isEditing}
          onClick={() => setIsEditing((editing) => !editing)}
          sx={{ width: 44, height: 44 }}
        >
          <PencilIcon />
        </IconButton>
      </Box>

      <Box
        role="group"
        aria-label="Estado de lectura"
        sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}
      >
        {statusOptions.map(({ value, label }) => (
          <Pill
            key={value}
            label={label}
            selected={status === value}
            onClick={() => setStatus(value)}
          />
        ))}
      </Box>

      <Accordion
        title="Más detalles"
        expanded={areDetailsExpanded}
        onChange={setAreDetailsExpanded}
      >
        <FloatingLabelInput
          label="Año de publicación"
          error={!!errors.publishedYear}
          helperText={errors.publishedYear?.message}
          slotProps={{ htmlInput: { inputMode: "numeric" } }}
          {...field("publishedYear", validationHandlers("publishedYear"))}
        />
        <FloatingLabelInput label="Idioma" {...field("language")} />
        <FloatingLabelInput
          label="Páginas"
          error={!!errors.pageCount}
          helperText={errors.pageCount?.message}
          slotProps={{ htmlInput: { inputMode: "numeric" } }}
          {...field("pageCount", validationHandlers("pageCount"))}
        />
      </Accordion>

      <Button type="submit" fullWidth disabled={isLoading}>
        {isLoading ? "Guardando…" : "Guardar libro"}
      </Button>
    </Box>
  );
};

export default ConfirmBookStep;
