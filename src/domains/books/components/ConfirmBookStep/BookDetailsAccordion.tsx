import { useFormContext } from "react-hook-form";
import Accordion from "../../../../components/ui/Accordion/Accordion";
import FloatingLabelInput from "../../../../components/ui/FloatingLabelInput/FloatingLabelInput";
import { useFieldValidation } from "../../../auth/hooks/useFieldValidation";
import type { ConfirmBookFormValues } from "../../utils/confirmBookSchema";

interface BookDetailsAccordionProps {
  expanded: boolean;
  onChange: (expanded: boolean) => void;
}

// Campos opcionales plegados: año, idioma y páginas.
const BookDetailsAccordion = ({
  expanded,
  onChange,
}: BookDetailsAccordionProps) => {
  const form = useFormContext<ConfirmBookFormValues>();
  const validationHandlers = useFieldValidation(form);
  const {
    register: field,
    formState: { errors },
  } = form;

  return (
    <Accordion title="Más detalles" expanded={expanded} onChange={onChange}>
      <FloatingLabelInput
        label="Año de publicación"
        error={!!errors.publishedYear}
        helperText={errors.publishedYear?.message}
        slotProps={{ htmlInput: { inputMode: "numeric" } }}
        {...field("publishedYear", validationHandlers("publishedYear"))}
      />
      <FloatingLabelInput
        label="Idioma"
        error={!!errors.language}
        helperText={errors.language?.message}
        {...field("language", validationHandlers("language"))}
      />
      <FloatingLabelInput
        label="Páginas"
        error={!!errors.pageCount}
        helperText={errors.pageCount?.message}
        slotProps={{ htmlInput: { inputMode: "numeric" } }}
        {...field("pageCount", validationHandlers("pageCount"))}
      />
    </Accordion>
  );
};

export default BookDetailsAccordion;
