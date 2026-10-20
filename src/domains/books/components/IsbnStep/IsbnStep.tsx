import { useState } from "react";
import type { FormEvent } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "../../../../components/ui/Button/Button";
import FloatingLabelInput from "../../../../components/ui/FloatingLabelInput/FloatingLabelInput";
import { useLazyLookupIsbnQuery } from "../../booksApi";
import type { ExternalBook } from "../../dto/ExternalBook";
import { getBookLookupError } from "../../utils/getBookLookupError";
import { isValidIsbn } from "../../utils/isValidIsbn";
import { normalizeIsbn } from "../../utils/normalizeIsbn";

interface IsbnStepProps {
  onBookFound: (book: ExternalBook) => void;
}

// «Escribir ISBN» (HU-41): la consulta solo se lanza con un ISBN completo y
// válido, al pulsar el botón o Enter; nunca en cada tecla.
const IsbnStep = ({ onBookFound }: IsbnStepProps) => {
  const [isbn, setIsbn] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [lookupIsbn, { isFetching }] = useLazyLookupIsbnQuery();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (isbn.trim() === "") {
      setFieldError("Escribe el ISBN");
      return;
    }

    if (!isValidIsbn(isbn)) {
      setFieldError(
        "El ISBN no es válido. Debe tener 10 o 13 cifras y estar bien escrito.",
      );
      return;
    }

    setFieldError(null);
    const result = await lookupIsbn(normalizeIsbn(isbn), true);

    if (result.data) {
      onBookFound(result.data);
      return;
    }

    const { message, field } = getBookLookupError(result.error);

    if (field === "isbn") {
      setFieldError(message);
    } else {
      setFormError(message);
    }
  };

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit}
      sx={{ display: "grid", gap: 5 }}
    >
      {formError && <Alert severity="error">{formError}</Alert>}
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
