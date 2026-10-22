import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Button from "../../../../components/ui/Button/Button";
import FloatingLabelInput from "../../../../components/ui/FloatingLabelInput/FloatingLabelInput";
import { useFieldValidation } from "../../../auth/hooks/useFieldValidation";
import { getFormErrorMessage } from "../../../auth/utils/getFormErrorMessage";
import { parseApiError } from "../../../auth/utils/parseApiError";
import type { Quote } from "../../dto/Quote";
import {
  useCreateQuoteMutation,
  useUpdateQuoteMutation,
} from "../../quotesApi";
import { buildCreateQuoteRequest } from "../../utils/buildCreateQuoteRequest";
import { buildUpdateQuoteRequest } from "../../utils/buildUpdateQuoteRequest";
import { quoteSchema } from "../../utils/quoteSchema";
import type { QuoteFormValues } from "../../utils/quoteSchema";

interface QuoteFormProps {
  // Sin `ejemplarId` (y sin `quote`) la cita no va ligada a ningún libro.
  ejemplarId?: string;
  // Si se informa, el formulario edita esa cita en vez de crear una nueva.
  quote?: Quote;
  // Texto de partida (el reconocido por el OCR) y de dónde viene.
  initialText?: string;
  origin?: "manual" | "ocr";
  onClose: () => void;
}

// Formulario de una cita (HU-25, HU-26, HU-30): el texto, venga del OCR o
// escrito a mano, siempre se revisa y se guarda solo al confirmar.
const QuoteForm = ({
  ejemplarId,
  quote,
  initialText = "",
  origin = "manual",
  onClose,
}: QuoteFormProps) => {
  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      text: quote?.text ?? initialText,
      source: quote?.source ?? "",
      page: quote?.page?.toString() ?? "",
    },
  });
  const {
    register: field,
    handleSubmit,
    setError,
    formState: { errors },
  } = form;
  const validationHandlers = useFieldValidation(form);
  // Solo las citas sin libro tienen fuente.
  const isLoose = quote ? !quote.book : ejemplarId === undefined;
  const [formError, setFormError] = useState<string | null>(null);
  const [createQuote, { isLoading: isCreating }] = useCreateQuoteMutation();
  const [updateQuote, { isLoading: isUpdating }] = useUpdateQuoteMutation();
  const isLoading = isCreating || isUpdating;

  const onSubmit = async (values: QuoteFormValues) => {
    setFormError(null);
    let result;

    if (quote) {
      const changes = buildUpdateQuoteRequest(quote, values);

      if (!changes) {
        onClose();
        return;
      }
      result = await updateQuote({ quoteId: quote.id, changes });
    } else {
      result = await createQuote(
        buildCreateQuoteRequest(ejemplarId, values, origin),
      );
    }

    if (!result.error) {
      onClose();
      return;
    }

    const apiError = parseApiError(result.error);

    if (apiError?.code === "VALIDATION_ERROR") {
      if (
        apiError.field === "text" ||
        apiError.field === "page" ||
        apiError.field === "source"
      ) {
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
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: "grid", gap: 5 }}
    >
      {formError && <Alert severity="error">{formError}</Alert>}
      <FloatingLabelInput
        label="Cita"
        multiline
        minRows={5}
        error={!!errors.text}
        helperText={errors.text?.message}
        {...field("text", validationHandlers("text"))}
      />
      {isLoose && (
        <FloatingLabelInput
          label="Fuente (opcional)"
          error={!!errors.source}
          helperText={
            errors.source?.message ?? "Por ejemplo, un paper o una biblioteca."
          }
          {...field("source", validationHandlers("source"))}
        />
      )}
      <FloatingLabelInput
        label="Página (opcional)"
        error={!!errors.page}
        helperText={errors.page?.message}
        slotProps={{ htmlInput: { inputMode: "numeric" } }}
        {...field("page", validationHandlers("page"))}
      />
      <Box sx={{ display: "grid", gap: 2 }}>
        <Button type="submit" fullWidth disabled={isLoading}>
          {isLoading
            ? "Guardando…"
            : quote
              ? "Guardar cambios"
              : "Guardar cita"}
        </Button>
        <Button variant="text" fullWidth disabled={isLoading} onClick={onClose}>
          Cancelar
        </Button>
      </Box>
    </Box>
  );
};

export default QuoteForm;
