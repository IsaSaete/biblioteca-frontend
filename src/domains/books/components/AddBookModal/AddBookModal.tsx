import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FullScreenModal from "../../../../components/ui/FullScreenModal/FullScreenModal";
import Pill from "../../../../components/ui/Pill/Pill";
import type { ExternalBook } from "../../dto/ExternalBook";
import ConfirmBookStep from "../ConfirmBookStep/ConfirmBookStep";
import { useHasCamera } from "../../hooks/useHasCamera";
import IsbnStep from "../IsbnStep/IsbnStep";
import ScanStep from "../ScanStep/ScanStep";
import SearchStep from "../SearchStep/SearchStep";

interface AddBookModalProps {
  // Abrir directamente en el escaneo (icono de la barra superior).
  initialStep?: "scan";
  onClose: () => void;
}

type Step =
  | { name: "choose" }
  | { name: "scan" }
  | { name: "isbn"; isbn?: string; autoLookup?: boolean }
  | { name: "search"; query?: string }
  | { name: "manual"; isbn?: string; back: Step }
  | { name: "confirm"; book: ExternalBook; back: Step };

const headings: Record<Step["name"], { title: string; subtitle: string }> = {
  choose: {
    title: "Añade un libro",
    subtitle: "Elige cómo quieres añadirlo",
  },
  scan: {
    title: "Escanea el código",
    subtitle: "Apunta la cámara al código de barras del libro.",
  },
  isbn: {
    title: "Escribe el ISBN",
    subtitle: "Buscaremos el libro y rellenaremos sus datos.",
  },
  search: {
    title: "Busca un libro",
    subtitle: "Escribe su título o el nombre del autor.",
  },
  manual: {
    title: "Añade los datos",
    subtitle: "Título, autor y editorial son obligatorios.",
  },
  confirm: {
    title: "Confirma los datos",
    subtitle: "Revisa que sean correctos antes de guardar.",
  },
};

const TITLE_ID = "add-book-title";

const PencilIcon = () => (
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
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </svg>
);

const SearchIcon = () => (
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
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
);

const BarcodeIcon = () => (
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
    <path d="M3 5v14M7 5v14M11 5v14M15 5v14M19 5v14M21 5v14" />
  </svg>
);

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

// Flujo «Añadir libro». Cada paso que avanza guarda a dónde vuelve «Volver».
// «Escanear código de barras» solo se ofrece si hay cámara (en escritorio sin
// ella queda «Escribir ISBN», que llega al mismo autocompletado).
const AddBookModal = ({ initialStep, onClose }: AddBookModalProps) => {
  const [step, setStep] = useState<Step>(
    initialStep === "scan" ? { name: "scan" } : { name: "choose" },
  );
  const heading = headings[step.name];
  const hasCamera = useHasCamera();

  const handleBack = (): void => {
    if (
      step.name === "isbn" ||
      step.name === "search" ||
      step.name === "scan"
    ) {
      setStep({ name: "choose" });
    } else if (step.name === "manual" || step.name === "confirm") {
      setStep(step.back);
    }
  };

  return (
    <FullScreenModal
      titleId={TITLE_ID}
      onClose={onClose}
      onBack={step.name === "choose" ? undefined : handleBack}
    >
      <Box sx={{ display: "grid", gap: 6, pt: 4 }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography id={TITLE_ID} variant="h6" component="h2">
            {heading.title}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {heading.subtitle}
          </Typography>
        </Box>

        {step.name === "choose" && (
          <Box sx={{ display: "grid", gap: 3 }}>
            {hasCamera && (
              <Pill
                fullWidth
                icon={<BarcodeIcon />}
                label="Escanear código de barras"
                onClick={() => setStep({ name: "scan" })}
              />
            )}
            <Pill
              fullWidth
              icon={<KeyboardIcon />}
              label="Escribir ISBN"
              onClick={() => setStep({ name: "isbn" })}
            />
            <Pill
              fullWidth
              icon={<SearchIcon />}
              label="Buscar por título o autor"
              onClick={() => setStep({ name: "search" })}
            />
            <Pill
              fullWidth
              icon={<PencilIcon />}
              label="Añadir manualmente"
              onClick={() => setStep({ name: "manual", back: step })}
            />
          </Box>
        )}
        {step.name === "scan" && (
          <ScanStep
            onIsbnScanned={(isbn) =>
              setStep({ name: "isbn", isbn, autoLookup: true })
            }
            onWriteIsbn={() => setStep({ name: "isbn" })}
          />
        )}
        {step.name === "isbn" && (
          <IsbnStep
            initialIsbn={step.isbn}
            autoLookup={step.autoLookup}
            onBookFound={(book) =>
              setStep({
                name: "confirm",
                book,
                // Volver no debe repetir la consulta automática.
                back: { name: "isbn", isbn: step.isbn },
              })
            }
            onManualEntry={(isbn) =>
              setStep({
                name: "manual",
                isbn,
                back: { name: "isbn", isbn: step.isbn },
              })
            }
          />
        )}
        {step.name === "search" && (
          <SearchStep
            initialQuery={step.query}
            onBookSelected={(book, query) =>
              setStep({
                name: "confirm",
                book,
                back: { name: "search", query },
              })
            }
            onManualEntry={(query) =>
              setStep({
                name: "manual",
                back: { name: "search", query },
              })
            }
          />
        )}
        {step.name === "manual" && (
          <ConfirmBookStep
            book={{
              title: "",
              authors: [],
              ...(step.isbn && { isbn: step.isbn }),
            }}
            isManual
            onSaved={onClose}
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
