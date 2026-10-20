import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FullScreenModal from "../../../../components/ui/FullScreenModal/FullScreenModal";
import Pill from "../../../../components/ui/Pill/Pill";
import type { ExternalBook } from "../../dto/ExternalBook";
import ConfirmBookStep from "../ConfirmBookStep/ConfirmBookStep";
import IsbnStep from "../IsbnStep/IsbnStep";

interface AddBookModalProps {
  onClose: () => void;
}

type Step =
  | { name: "choose" }
  | { name: "isbn" }
  | { name: "confirm"; book: ExternalBook };

const TITLE_ID = "add-book-title";

const KeyboardIcon = () => (
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
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" />
  </svg>
);

// Flujo «Añadir libro». Solo se ofrecen las vías ya implementadas (escanear,
// buscar y alta manual se suman con sus historias): nunca una función que no
// existe.
const AddBookModal = ({ onClose }: AddBookModalProps) => {
  const [step, setStep] = useState<Step>({ name: "choose" });

  const heading =
    step.name === "choose"
      ? {
          title: "Añade un libro",
          subtitle:
            "Elige cómo quieres añadir el próximo libro a tu biblioteca",
        }
      : step.name === "isbn"
        ? {
            title: "Escribe el ISBN",
            subtitle: "Buscaremos el libro y rellenaremos sus datos.",
          }
        : {
            title: "Confirma los datos",
            subtitle: "Revisa que sean correctos antes de guardar.",
          };

  const handleBack =
    step.name === "isbn"
      ? () => setStep({ name: "choose" })
      : step.name === "confirm"
        ? () => setStep({ name: "isbn" })
        : undefined;

  return (
    <FullScreenModal titleId={TITLE_ID} onClose={onClose} onBack={handleBack}>
      <Box sx={{ display: "grid", gap: 6, pt: 4 }}>
        <Box>
          <Typography id={TITLE_ID} variant="h6" component="h2">
            {heading.title}
          </Typography>
          <Typography color="text.secondary">{heading.subtitle}</Typography>
        </Box>

        {step.name === "choose" && (
          <Box sx={{ display: "grid", gap: 3, justifyItems: "center" }}>
            <Pill
              icon={<KeyboardIcon />}
              label="Escribir ISBN"
              onClick={() => setStep({ name: "isbn" })}
            />
          </Box>
        )}
        {step.name === "isbn" && (
          <IsbnStep
            onBookFound={(book) => setStep({ name: "confirm", book })}
          />
        )}
        {step.name === "confirm" && (
          <ConfirmBookStep book={step.book} onSaved={onClose} />
        )}
      </Box>
    </FullScreenModal>
  );
};

export default AddBookModal;
