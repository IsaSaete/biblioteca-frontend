import { useFormContext, useWatch } from "react-hook-form";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import FloatingLabelInput from "../../../../components/ui/FloatingLabelInput/FloatingLabelInput";
import { useFieldValidation } from "../../../auth/hooks/useFieldValidation";
import type { ConfirmBookFormValues } from "../../utils/confirmBookSchema";

interface BookDataSectionProps {
  isEditing: boolean;
  // Con el lápiz se abren y se cierran los campos; sin él, los datos que hay
  // (por ejemplo, en el alta manual) se ven siempre abiertos.
  canToggleEditing: boolean;
  onToggleEditing: () => void;
}

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

// Título, autores y editorial: como texto, o como campos si se están editando.
// Solo conoce el formulario por su contexto.
const BookDataSection = ({
  isEditing,
  canToggleEditing,
  onToggleEditing,
}: BookDataSectionProps) => {
  const form = useFormContext<ConfirmBookFormValues>();
  const validationHandlers = useFieldValidation(form);
  const {
    register: field,
    control,
    formState: { errors },
  } = form;
  const [title, authors, publisher] = useWatch({
    control,
    name: ["title", "authors", "publisher"],
  });

  return (
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
            {title}
          </Typography>
          <Typography color="text.secondary">{authors}</Typography>
          <Typography color="text.secondary">{publisher}</Typography>
        </Box>
      )}
      {canToggleEditing && (
        <IconButton
          aria-label="Editar datos del libro"
          aria-pressed={isEditing}
          onClick={onToggleEditing}
          sx={{ width: 44, height: 44 }}
        >
          <PencilIcon />
        </IconButton>
      )}
    </Box>
  );
};

export default BookDataSection;
