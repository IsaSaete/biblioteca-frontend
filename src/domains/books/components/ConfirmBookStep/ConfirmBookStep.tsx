import { useState } from "react";
import { FormProvider, useWatch } from "react-hook-form";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import type { BookStatus } from "../../dto/BookStatus";
import type { ExternalBook } from "../../dto/ExternalBook";
import type { ConfirmBookFormValues } from "../../utils/confirmBookSchema";
import BookCover from "../BookCover/BookCover";
import BookDataSection from "./BookDataSection";
import BookDetailsAccordion from "./BookDetailsAccordion";
import { getConfirmBookVariant } from "./confirmBookVariant";
import type { ConfirmBookMode } from "./confirmBookVariant";
import ReadingStatusPicker from "./ReadingStatusPicker";
import SaveActions from "./SaveActions";
import type { SaveResult } from "./useBookSaver";
import { useBookSaver } from "./useBookSaver";
import { useConfirmBookForm } from "./useConfirmBookForm";
import WishlistNoteField from "./WishlistNoteField";

interface ConfirmBookStepProps {
  book: ExternalBook;
  // Alta manual (HU-17): nada que confirmar, así que los campos están siempre
  // abiertos y no hay lápiz ni portada.
  isManual?: boolean;
  // Añadir el libro a la «Lista de deseos»: sin estado de lectura, con nota opcional
  // y de solo lectura si viene del catálogo (un deseado no tiene correcciones).
  mode?: ConfirmBookMode;
  // Con el id del libro si se guardó en la biblioteca.
  onSaved: (bookId?: string) => void;
}

// «Confirma los datos» (HU-18) y estado de lectura (HU-19): los datos se ven
// como texto: un ISBN es una edición concreta y se corrige después, en el
// editor del libro. La editorial es obligatoria al guardar y los proveedores a
// menudo no la dan, así que sin ella los datos se abren ya como campos.
//
// Solo compone: qué se enseña en cada modo lo decide `getConfirmBookVariant`,
// el formulario y qué está abierto, `useConfirmBookForm`, y cómo se guarda,
// `useBookSaver`.
const ConfirmBookStep = ({
  book,
  isManual = false,
  mode,
  onSaved,
}: ConfirmBookStepProps) => {
  const variant = getConfirmBookVariant(mode, isManual);
  const {
    form,
    isEditing,
    areDetailsExpanded,
    setAreDetailsExpanded,
    showFieldError,
    revealInvalidFields,
  } = useConfirmBookForm(book, {
    // Campos abiertos solo si falta algo obligatorio: con la ficha completa,
    // solo se confirma.
    startsEditing:
      isManual || !book.publisher || book.authors.length === 0 || !book.title,
  });
  const { saveToLibrary, saveToWishlist, isCreating, isAdding } =
    useBookSaver(book);
  const [status, setStatus] = useState<BookStatus>("pending");
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const title = useWatch({ control: form.control, name: "title" });

  const finish = (result: SaveResult) => {
    if (result.ok) {
      onSaved(result.bookId);
    } else if (result.failure.kind === "field") {
      showFieldError(result.failure.field, result.failure.message);
      // El campo puede no verse (en un libro de catálogo no hay campos): el
      // aviso junto al botón garantiza que el error se vea siempre.
      setFormError(result.failure.message);
    } else {
      setFormError(result.failure.message);
    }
  };

  const submitToLibrary = async (values: ConfirmBookFormValues) => {
    setFormError(null);
    finish(await saveToLibrary(values, status));
  };

  // La nota solo se pide en el modo «Lista de deseos»; en la biblioteca, el
  // acceso directo no la envía.
  const submitToWishlist = async (values: ConfirmBookFormValues) => {
    setFormError(null);
    finish(
      await saveToWishlist(values, variant.extra === "note" ? note : undefined),
    );
  };

  const submit =
    variant.submitsTo === "wishlist" ? submitToWishlist : submitToLibrary;

  return (
    <FormProvider {...form}>
      <Box
        component="form"
        noValidate
        onSubmit={form.handleSubmit(submit, revealInvalidFields)}
        sx={{ display: "grid", gap: 5 }}
      >
        {variant.showsCover && (
          <Box sx={{ width: 120, justifySelf: "center" }}>
            <BookCover title={title} coverUrl={book.coverUrl} />
          </Box>
        )}

        <BookDataSection isEditing={isEditing} />

        {variant.extra === "note" ? (
          <WishlistNoteField value={note} onChange={setNote} />
        ) : (
          <ReadingStatusPicker value={status} onChange={setStatus} />
        )}

        {variant.showsDetails && (
          <BookDetailsAccordion
            expanded={areDetailsExpanded}
            onChange={setAreDetailsExpanded}
          />
        )}

        {formError && <Alert severity="error">{formError}</Alert>}

        <SaveActions
          submitsTo={variant.submitsTo}
          isCreating={isCreating}
          isAdding={isAdding}
          onSaveToWishlist={() =>
            void form.handleSubmit(submitToWishlist, revealInvalidFields)()
          }
        />
      </Box>
    </FormProvider>
  );
};

export default ConfirmBookStep;
