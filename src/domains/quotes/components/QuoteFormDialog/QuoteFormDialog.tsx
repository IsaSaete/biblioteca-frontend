import { useEffect, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Button from "../../../../components/ui/Button/Button";
import FullScreenModal from "../../../../components/ui/FullScreenModal/FullScreenModal";
import Pill from "../../../../components/ui/Pill/Pill";
import { useHasCamera } from "../../../books/hooks/useHasCamera";
import type { Quote } from "../../dto/Quote";
import { recognizeText } from "../../ocr/recognizeText";
import CameraCapture from "../CameraCapture/CameraCapture";
import QuoteForm from "../QuoteForm/QuoteForm";

interface QuoteFormDialogProps {
  ejemplarId: string;
  bookTitle: string;
  // Si se informa, el diálogo edita esa cita en vez de crear una nueva.
  quote?: Quote;
  onClose: () => void;
}

type Step =
  | { name: "choose" }
  | { name: "scan"; notice?: string }
  | { name: "reading"; image: HTMLCanvasElement }
  | { name: "review"; text: string; origin: "manual" | "ocr" };

const TITLE_ID = "quote-form-title";

const NO_TEXT_NOTICE =
  "No hemos encontrado texto en la foto. Prueba con más luz y más cerca del texto.";
const READ_FAILED_NOTICE =
  "No se pudo leer el texto. Inténtalo de nuevo o escribe la cita a mano.";

interface ReadingStepProps {
  image: HTMLCanvasElement;
  onRead: (text: string) => void;
  onFail: (notice: string) => void;
  onCancel: () => void;
}

// Lectura de la foto con OCR en el propio dispositivo (HU-24). La foto solo
// existe aquí: se descarta al terminar o al cancelar, nunca se guarda ni se sube.
const ReadingStep = ({ image, onRead, onFail, onCancel }: ReadingStepProps) => {
  const [progress, setProgress] = useState(0);
  // Los avisos al padre van por ref: si cambian entre renders no deben relanzar
  // una lectura que ya está en marcha.
  const callbacks = useRef({ onRead, onFail });

  useEffect(() => {
    callbacks.current = { onRead, onFail };
  }, [onRead, onFail]);

  useEffect(() => {
    let isCancelled = false;

    recognizeText(image, {
      onProgress: (value) => !isCancelled && setProgress(value),
    })
      .then((text) => {
        if (isCancelled) {
          return;
        }
        if (text === "") {
          callbacks.current.onFail(NO_TEXT_NOTICE);
        } else {
          callbacks.current.onRead(text);
        }
      })
      .catch(
        () => !isCancelled && callbacks.current.onFail(READ_FAILED_NOTICE),
      );

    return () => {
      isCancelled = true;
    };
  }, [image]);

  return (
    <Box sx={{ display: "grid", gap: 4 }}>
      <LinearProgress
        variant="determinate"
        value={Math.round(progress * 100)}
        aria-label="Progreso de la lectura"
      />
      <Typography
        role="status"
        color="text.secondary"
        sx={{ textAlign: "center" }}
      >
        Leyendo el texto…
      </Typography>
      <Button variant="text" fullWidth onClick={onCancel}>
        Cancelar
      </Button>
    </Box>
  );
};

const headings: Record<Step["name"], { title: string; subtitle?: string }> = {
  choose: { title: "Añade una cita", subtitle: "Elige cómo quieres añadirla" },
  scan: {
    title: "Escanea la cita",
    subtitle: "La foto se lee en tu dispositivo y no se guarda.",
  },
  reading: { title: "Leyendo la foto" },
  review: { title: "Escribe una cita" },
};

// Añadir una cita al libro ya elegido —escaneando con la cámara (HU-24, HU-25)
// o escribiéndola (HU-26)— o editar una existente (HU-30). El texto reconocido
// nunca se guarda sin que el usuario lo revise.
const QuoteFormDialog = ({
  ejemplarId,
  bookTitle,
  quote,
  onClose,
}: QuoteFormDialogProps) => {
  const hasCamera = useHasCamera();
  const [step, setStep] = useState<Step>(
    quote
      ? { name: "review", text: quote.text, origin: "manual" }
      : { name: "choose" },
  );
  // Qué hay detrás de «Atrás» en cada paso (no hay en elegir ni al editar).
  const goBack =
    step.name === "scan" || (step.name === "review" && !quote)
      ? () => setStep({ name: "choose" })
      : undefined;

  const heading = quote
    ? { title: "Edita la cita" }
    : step.name === "review" && step.origin === "ocr"
      ? {
          title: "Revisa el texto",
          subtitle: "Puede tener errores: corrígelo antes de guardar.",
        }
      : headings[step.name];

  const renderStep = () => {
    switch (step.name) {
      case "choose":
        return (
          <Box sx={{ display: "grid", gap: 3 }}>
            {hasCamera && (
              <Pill
                label="Escanear con la cámara"
                fullWidth
                onClick={() => setStep({ name: "scan" })}
              />
            )}
            <Pill
              label="Escribir manualmente"
              fullWidth
              onClick={() =>
                setStep({ name: "review", text: "", origin: "manual" })
              }
            />
          </Box>
        );
      case "scan":
        return (
          <Box sx={{ display: "grid", gap: 4 }}>
            {step.notice && <Alert severity="warning">{step.notice}</Alert>}
            <CameraCapture
              onCapture={(image) => setStep({ name: "reading", image })}
              onWrite={() =>
                setStep({ name: "review", text: "", origin: "manual" })
              }
            />
          </Box>
        );
      case "reading":
        return (
          <ReadingStep
            image={step.image}
            onRead={(text) => setStep({ name: "review", text, origin: "ocr" })}
            onFail={(notice) => setStep({ name: "scan", notice })}
            onCancel={() => setStep({ name: "scan" })}
          />
        );
      case "review":
        return (
          <QuoteForm
            ejemplarId={ejemplarId}
            quote={quote}
            initialText={step.text}
            origin={step.origin}
            onClose={onClose}
          />
        );
    }
  };

  return (
    <FullScreenModal titleId={TITLE_ID} onClose={onClose} onBack={goBack}>
      <Box sx={{ display: "grid", gap: 5, pt: 4 }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography id={TITLE_ID} variant="h6" component="h2">
            {heading.title}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1, fontSize: "1rem" }}>
            {"subtitle" in heading && heading.subtitle
              ? heading.subtitle
              : bookTitle}
          </Typography>
          {"subtitle" in heading && heading.subtitle && (
            <Typography color="text.secondary" sx={{ mt: 1, fontSize: "1rem" }}>
              {bookTitle}
            </Typography>
          )}
        </Box>
        {renderStep()}
      </Box>
    </FullScreenModal>
  );
};

export default QuoteFormDialog;
