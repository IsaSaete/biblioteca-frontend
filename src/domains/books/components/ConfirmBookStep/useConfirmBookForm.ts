import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useFieldValidation } from "../../../auth/hooks/useFieldValidation";
import type { ExternalBook } from "../../dto/ExternalBook";
import { confirmBookSchema } from "../../utils/confirmBookSchema";
import type { ConfirmBookFormValues } from "../../utils/confirmBookSchema";
import { isDetailField } from "./confirmBookFields";
import type { ConfirmBookField } from "./confirmBookFields";
import { getSectionsToReveal } from "./revealFields";

const getDefaultValues = (book: ExternalBook): ConfirmBookFormValues => ({
  title: book.title,
  authors: book.authors.join(", "),
  publisher: book.publisher ?? "",
  publishedYear: book.publishedYear?.toString() ?? "",
  language: book.language ?? "",
  pageCount: book.pageCount?.toString() ?? "",
});

// El formulario de datos del libro y qué parte está abierta: los datos se ven
// como texto y solo se abren como campos si falta algo o hay un error.
// Ningún error se queda en un campo que no se ve.
export const useConfirmBookForm = (
  book: ExternalBook,
  { startsEditing }: { startsEditing: boolean },
) => {
  const form = useForm<ConfirmBookFormValues>({
    resolver: zodResolver(confirmBookSchema),
    defaultValues: getDefaultValues(book),
  });
  const validationHandlers = useFieldValidation(form);
  const [isEditing, setIsEditing] = useState(startsEditing);
  const [areDetailsExpanded, setAreDetailsExpanded] = useState(false);

  // Error que llega del servidor para un campo: se muestra y se abre lo que lo
  // contiene.
  const showFieldError = (field: ConfirmBookField, message: string) => {
    form.setError(field, { message });
    setIsEditing(true);
    setAreDetailsExpanded((expanded) => expanded || isDetailField(field));
  };

  // Errores de validación al enviar: abre lo que contiene los campos erróneos.
  const revealInvalidFields = () => {
    const { editing, details } = getSectionsToReveal(
      Object.keys(form.formState.errors),
    );

    if (editing) {
      setIsEditing(true);
    }
    if (details) {
      setAreDetailsExpanded(true);
    }
  };

  return {
    form,
    validationHandlers,
    isEditing,
    areDetailsExpanded,
    setAreDetailsExpanded,
    showFieldError,
    revealInvalidFields,
  };
};
