import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Button from "../../../../components/ui/Button/Button";
import FloatingLabelInput from "../../../../components/ui/FloatingLabelInput/FloatingLabelInput";
import FullScreenModal from "../../../../components/ui/FullScreenModal/FullScreenModal";
import { useFieldValidation } from "../../../auth/hooks/useFieldValidation";
import { getFormErrorMessage } from "../../../auth/utils/getFormErrorMessage";
import { parseApiError } from "../../../auth/utils/parseApiError";
import { useCreateQuoteMutation } from "../../quotesApi";
import { buildCreateQuoteRequest } from "../../utils/buildCreateQuoteRequest";
import { quoteSchema } from "../../utils/quoteSchema";
import type { QuoteFormValues } from "../../utils/quoteSchema";

interface AddQuoteDialogProps {
  ejemplarId: string;
  bookTitle: string;
  onClose: () => void;
}

const TITLE_ID = "add-quote-title";

// Añadir una cita escrita a mano (HU-26) desde la ficha, con el libro ya
// elegido. El escaneo con cámara se añadirá aquí con HU-24/25: hasta entonces
// no se ofrece.
const AddQuoteDialog = ({
  ejemplarId,
  bookTitle,
  onClose,
}: AddQuoteDialogProps) => {
  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: { text: "", page: "" },
  });
  const {
    register: field,
    handleSubmit,
    setError,
    formState: { errors },
  } = form;
  const validationHandlers = useFieldValidation(form);
  const [formError, setFormError] = useState<string | null>(null);
  const [createQuote, { isLoading }] = useCreateQuoteMutation();

  const onSubmit = async (values: QuoteFormValues) => {
    setFormError(null);
    const result = await createQuote(
      buildCreateQuoteRequest(ejemplarId, values),
    );

    if (!result.error) {
      onClose();
      return;
    }

    const apiError = parseApiError(result.error);

    if (apiError?.code === "VALIDATION_ERROR") {
      if (apiError.field === "text" || apiError.field === "page") {
        setError(apiError.field, { message: apiError.message });
        return;
      }
    }

    setFormError(
      getFormErrorMessage(
        result.error,
        "No se pudo guardar la cita. Inténtalo de nuevo.",
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
            Añade una cita
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1, fontSize: "1rem" }}>
            {bookTitle}
          </Typography>
        </Box>
        {formError && <Alert severity="error">{formError}</Alert>}
        <FloatingLabelInput
          label="Cita"
          multiline
          minRows={5}
          error={!!errors.text}
          helperText={errors.text?.message}
          {...field("text", validationHandlers("text"))}
        />
        <FloatingLabelInput
          label="Página (opcional)"
          error={!!errors.page}
          helperText={errors.page?.message}
          slotProps={{ htmlInput: { inputMode: "numeric" } }}
          {...field("page", validationHandlers("page"))}
        />
        <Box sx={{ display: "grid", gap: 2 }}>
          <Button type="submit" fullWidth disabled={isLoading}>
            {isLoading ? "Guardando…" : "Guardar cita"}
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

export default AddQuoteDialog;
