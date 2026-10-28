import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "../../../../components/ui/Button/Button";
import ConfirmDialog from "../../../../components/ui/ConfirmDialog/ConfirmDialog";
import ExpandableText from "../../../../components/ui/ExpandableText/ExpandableText";
import FullScreenModal from "../../../../components/ui/FullScreenModal/FullScreenModal";
import FloatingLabelInput from "../../../../components/ui/FloatingLabelInput/FloatingLabelInput";
import Pill from "../../../../components/ui/Pill/Pill";
import type { BookStatus } from "../../../books/dto/BookStatus";
import BookCover from "../../../books/components/BookCover/BookCover";
import { statusOptions } from "../../../books/utils/statusOptions";
import type { WishlistItem } from "../../dto/WishlistItem";
import {
  useAcquireWishlistItemMutation,
  useRemoveFromWishlistMutation,
  useUpdateWishlistNoteMutation,
} from "../../wishlistApi";

const NOTE_MAX_LENGTH = 500;

interface WishlistItemSheetProps {
  item: WishlistItem;
  onClose: () => void;
  // Avisa de lo que ha pasado cuando la hoja se cierra al pasar el libro a la
  // biblioteca o al quitarlo: lo enseña quien la abrió, porque la hoja ya no
  // está.
  onDone: (message: string) => void;
}

const TITLE_ID = "wishlist-item-title";

// Hoja de un deseado (D-036): portada y datos, la nota editable en el sitio y
// las dos salidas: «Ya lo tengo» lo pasa a la biblioteca (pidiendo el estado de
// lectura, «Pendiente» por defecto) y «Quitar de la lista» lo borra. No hay
// ficha completa: un deseado no tiene ejemplar, etiquetas ni citas. Hoja
// completa en móvil y diálogo centrado desde tablet, como «Añadir libro»: la ✕
// a la derecha y, en el paso del estado, la flecha de volver a la izquierda.
// Solo se cierra con la ✕, Esc o sus acciones (no al tocar fuera), y si hay una
// nota sin guardar pide confirmación antes de descartarla.
const WishlistItemSheet = ({
  item,
  onClose,
  onDone,
}: WishlistItemSheetProps) => {
  const { book } = item;
  const [savedNote, setSavedNote] = useState(item.note ?? "");
  const [note, setNote] = useState(savedNote);
  const [isChoosingStatus, setIsChoosingStatus] = useState(false);
  const [status, setStatus] = useState<BookStatus>("pending");
  const [isConfirmingRemove, setIsConfirmingRemove] = useState(false);
  const [isConfirmingDiscard, setIsConfirmingDiscard] = useState(false);
  const [isNoteSaved, setIsNoteSaved] = useState(false);
  const [updateNote, { isLoading: isSavingNote, isError: hasNoteFailed }] =
    useUpdateWishlistNoteMutation();
  const [acquire, { isLoading: isAcquiring, isError: hasAcquireFailed }] =
    useAcquireWishlistItemMutation();
  const [remove, { isLoading: isRemoving, isError: hasRemoveFailed }] =
    useRemoveFromWishlistMutation();

  const trimmedNote = note.trim();
  const hasNoteChanged = trimmedNote !== savedNote;

  const requestClose = () => {
    if (hasNoteChanged) {
      setIsConfirmingDiscard(true);
    } else {
      onClose();
    }
  };

  const handleSaveNote = async () => {
    const result = await updateNote({ id: item.id, note: trimmedNote || null });

    if (!result.error) {
      setSavedNote(trimmedNote);
      setIsNoteSaved(true);
    }
  };

  const handleAcquire = async () => {
    const result = await acquire({ id: item.id, status });

    if (!result.error) {
      onDone(`«${book.title}» se ha añadido a tu biblioteca.`);
      onClose();
    }
  };

  const handleRemove = async () => {
    const result = await remove(item.id);

    if (!result.error) {
      onDone(`«${book.title}» se ha quitado de tu lista de deseos.`);
      onClose();
    }
  };

  const content = (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          minHeight: "100%",
        }}
      >
        <Box sx={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: 4 }}>
          <BookCover title={book.title} coverUrl={book.coverUrl} size="small" />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              id={TITLE_ID}
              component="h2"
              sx={{ fontWeight: 700, overflowWrap: "anywhere" }}
            >
              {book.title}
            </Typography>
            <Typography color="text.secondary" variant="caption" component="p">
              {book.authors.join(", ")}
            </Typography>
          </Box>
        </Box>

        {book.synopsis && <ExpandableText text={book.synopsis} lines={4} />}

        <Box sx={{ display: "grid", gap: 2 }}>
          <FloatingLabelInput
            label="Nota"
            multiline
            minRows={2}
            fullWidth
            value={note}
            onChange={(event) => {
              setNote(event.target.value);
              setIsNoteSaved(false);
            }}
            helperText={`${note.length}/${NOTE_MAX_LENGTH}`}
            slotProps={{ htmlInput: { maxLength: NOTE_MAX_LENGTH } }}
          />
          {hasNoteChanged && (
            <Button
              variant="text"
              disabled={isSavingNote}
              onClick={() => void handleSaveNote()}
              sx={{ justifySelf: "end" }}
            >
              {isSavingNote ? "Guardando…" : "Guardar nota"}
            </Button>
          )}
          {isNoteSaved && !hasNoteChanged && (
            <Typography
              role="status"
              color="text.secondary"
              sx={{ fontSize: "0.875rem" }}
            >
              Nota guardada.
            </Typography>
          )}
          {hasNoteFailed && (
            <Alert severity="error">
              No se pudo guardar la nota. Inténtalo de nuevo.
            </Alert>
          )}
        </Box>

        {/* Las acciones se quedan siempre a la vista, abajo; lo demás hace scroll. */}
        <Box
          sx={{
            position: "sticky",
            bottom: 0,
            mt: "auto",
            pt: 3,
            bgcolor: "background.paper",
          }}
        >
          {isChoosingStatus ? (
            <Box sx={{ display: "grid", gap: 3 }}>
              <Typography color="text.secondary">
                ¿En qué estado lo añades a tu biblioteca?
              </Typography>
              <Box
                role="group"
                aria-label="Estado de lectura"
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 2,
                }}
              >
                {statusOptions.map(({ value, label, tone }) => (
                  <Pill
                    key={value}
                    label={label}
                    tone={tone}
                    fullWidth
                    selected={status === value}
                    onClick={() => setStatus(value)}
                  />
                ))}
              </Box>
              <Button
                fullWidth
                disabled={isAcquiring}
                onClick={() => void handleAcquire()}
              >
                {isAcquiring ? "Añadiendo…" : "Añadir a mi biblioteca"}
              </Button>
              {hasAcquireFailed && (
                <Alert severity="error">
                  No se pudo añadir el libro. Inténtalo de nuevo.
                </Alert>
              )}
            </Box>
          ) : (
            <Box sx={{ display: "grid", gap: 2 }}>
              <Button fullWidth onClick={() => setIsChoosingStatus(true)}>
                Ya lo tengo
              </Button>
              <Button
                variant="text"
                fullWidth
                onClick={() => setIsConfirmingRemove(true)}
                sx={{ color: "error.main" }}
              >
                Quitar de la lista
              </Button>
              {hasRemoveFailed && (
                <Alert severity="error">
                  No se pudo quitar el libro. Inténtalo de nuevo.
                </Alert>
              )}
            </Box>
          )}
        </Box>
      </Box>
      <ConfirmDialog
        open={isConfirmingRemove}
        title="¿Quitar de la lista?"
        description="El libro saldrá de tu lista de deseos."
        confirmLabel="Sí, quitar"
        pendingLabel="Quitando…"
        isPending={isRemoving}
        onConfirm={() => void handleRemove()}
        onCancel={() => setIsConfirmingRemove(false)}
      />
      <ConfirmDialog
        open={isConfirmingDiscard}
        title="¿Salir sin guardar la nota?"
        description="Has escrito una nota que no está guardada. Si sales, se perderá."
        confirmLabel="Sí, salir"
        pendingLabel="Saliendo…"
        isPending={false}
        onConfirm={() => {
          setIsConfirmingDiscard(false);
          onClose();
        }}
        onCancel={() => setIsConfirmingDiscard(false)}
      />
    </>
  );

  return (
    <FullScreenModal
      titleId={TITLE_ID}
      onClose={requestClose}
      onBack={isChoosingStatus ? () => setIsChoosingStatus(false) : undefined}
      disableBackdropClose
    >
      {content}
    </FullScreenModal>
  );
};

export default WishlistItemSheet;
