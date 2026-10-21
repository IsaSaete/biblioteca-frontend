import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "../../../../components/ui/Button/Button";
import FloatingLabelInput from "../../../../components/ui/FloatingLabelInput/FloatingLabelInput";
import { useLazyLookupIsbnQuery } from "../../booksApi";
import type { ExternalBook } from "../../dto/ExternalBook";
import { getBookLookupError } from "../../utils/getBookLookupError";
import type { BookLookupError } from "../../utils/getBookLookupError";
import { isValidIsbn } from "../../utils/isValidIsbn";
import { normalizeIsbn } from "../../utils/normalizeIsbn";

interface IsbnStepProps {
  // ISBN con el que arranca el campo. Con `autoLookup` se consulta nada más
  // abrir (ISBN leído con la cámara, ya validado).
  initialIsbn?: string;
  autoLookup?: boolean;
  onBookFound: (book: ExternalBook) => void;
  // Recibe el ISBN escrito para no obligar a repetirlo en el alta manual.
  onManualEntry: (isbn: string) => void;
}

// «Escribir ISBN» (HU-41): la consulta solo se lanza con un ISBN completo y
// válido, al pulsar el botón o Enter; nunca en cada tecla.
const IsbnStep = ({
  initialIsbn = "",
  autoLookup = false,
  onBookFound,
  onManualEntry,
}: IsbnStepProps) => {
  const [isbn, setIsbn] = useState(initialIsbn);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<BookLookupError | null>(null);
  const [lookupIsbn, { isFetching }] = useLazyLookupIsbnQuery();

  const search = async (value: string) => {
    setFormError(null);

    if (value.trim() === "") {
      setFieldError("Escribe el ISBN");
      return;
    }

    if (!isValidIsbn(value)) {
      setFieldError(
        "El ISBN no es válido. Debe tener 10 o 13 cifras y estar bien escrito.",
      );
      return;
    }

    setFieldError(null);
    const result = await lookupIsbn(normalizeIsbn(value), true);

    if (result.data) {
      onBookFound(result.data);
      return;
    }

    const lookupError = getBookLookupError(result.error);

    if (lookupError.field === "isbn") {
      setFieldError(lookupError.message);
    } else {
      setFormError(lookupError);
    }
  };

  const hasAutoLookedUp = useRef(false);

  useEffect(() => {
    if (autoLookup && !hasAutoLookedUp.current) {
      hasAutoLookedUp.current = true;
      void search(initialIsbn);
    }
    // Solo al abrir el paso.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await search(isbn);
  };

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit}
      sx={{ display: "grid", gap: 5 }}
    >
      {formError && (
        <Alert
          severity="error"
          action={
            formError.offersManualEntry && (
              <Button
                variant="text"
                color="inherit"
                onClick={() => onManualEntry(normalizeIsbn(isbn))}
              >
                Añadir manualmente
              </Button>
            )
          }
        >
          {formError.message}
        </Alert>
      )}
      <FloatingLabelInput
        label="ISBN"
        value={isbn}
        onChange={(event) => setIsbn(event.target.value)}
        error={fieldError !== null}
        helperText={
          fieldError ?? "Son los 10 o 13 números junto al código de barras."
        }
        autoComplete="off"
        slotProps={{ htmlInput: { inputMode: "text" } }}
      />
      <Button type="submit" fullWidth disabled={isFetching}>
        {isFetching ? "Buscando…" : "Buscar libro"}
      </Button>
    </Box>
  );
};

export default IsbnStep;
