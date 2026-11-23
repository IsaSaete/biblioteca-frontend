import { useFormContext, useWatch } from "react-hook-form";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FloatingLabelInput from "../../../../components/ui/FloatingLabelInput/FloatingLabelInput";
import { useFieldValidation } from "../../../auth/hooks/useFieldValidation";
import type { ConfirmBookFormValues } from "../../utils/confirmBookSchema";

interface BookDataSectionProps {
  // Con los datos de un catálogo se ven como texto; solo se abren como campos
  // si falta algo obligatorio o en el alta manual.
  isEditing: boolean;
}

// Título, autores y editorial: como texto, o como campos si hay que rellenarlos.
// Solo conoce el formulario por su contexto.
const BookDataSection = ({ isEditing }: BookDataSectionProps) => {
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
    </Box>
  );
};

export default BookDataSection;
