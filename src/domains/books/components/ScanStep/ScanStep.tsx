import { useEffect, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "../../../../components/ui/Button/Button";
import { extractIsbn } from "../../scanner/extractIsbn";
import { loadBarcodeDetector } from "../../scanner/loadBarcodeDetector";
import type { BarcodeReader } from "../../scanner/loadBarcodeDetector";

const SCAN_INTERVAL_MS = 250;
// Un ISBN solo se da por bueno si se lee igual en lecturas seguidas: evita
// consultar con una lectura suelta de un fotograma movido.
const REQUIRED_CONSECUTIVE_READS = 2;

type ScanStatus = "starting" | "scanning" | "denied" | "failed";

interface ScanStepProps {
  onIsbnScanned: (isbn: string) => void;
  onWriteIsbn: () => void;
}

const isPermissionError = (error: unknown): boolean =>
  error instanceof DOMException &&
  (error.name === "NotAllowedError" || error.name === "SecurityError");

// «Escanear código de barras» (HU-15). Abre la cámara trasera, lee el EAN-13
// del libro y entrega su ISBN. Al salir (o al leerlo) la cámara se apaga siempre.
const ScanStep = ({ onIsbnScanned, onWriteIsbn }: ScanStepProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onIsbnScannedRef = useRef(onIsbnScanned);
  const [status, setStatus] = useState<ScanStatus>("starting");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    onIsbnScannedRef.current = onIsbnScanned;
  }, [onIsbnScanned]);

  useEffect(() => {
    let isStopped = false;
    let stream: MediaStream | null = null;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const stop = () => {
      isStopped = true;
      clearTimeout(timeout);
      stream?.getTracks().forEach((track) => track.stop());
    };

    const scan = async (video: HTMLVideoElement, detector: BarcodeReader) => {
      let lastIsbn: string | null = null;
      let reads = 0;

      const tick = async () => {
        if (isStopped) {
          return;
        }

        try {
          const isbn = extractIsbn(await detector.detect(video));
          reads = isbn !== null && isbn === lastIsbn ? reads + 1 : isbn ? 1 : 0;
          lastIsbn = isbn;

          if (isbn !== null && reads >= REQUIRED_CONSECUTIVE_READS) {
            stop();
            onIsbnScannedRef.current(isbn);
            return;
          }
        } catch {
          // Fotograma sin imagen todavía: se vuelve a intentar.
        }

        timeout = setTimeout(() => void tick(), SCAN_INTERVAL_MS);
      };

      await tick();
    };

    const start = async () => {
      setStatus("starting");

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
      } catch (error) {
        if (!isStopped) {
          setStatus(isPermissionError(error) ? "denied" : "failed");
        }
        return;
      }

      const video = videoRef.current;

      if (isStopped || !video) {
        stop();
        return;
      }

      video.srcObject = stream;
      await video.play().catch(() => undefined);

      let detector: BarcodeReader;

      try {
        detector = await loadBarcodeDetector();
      } catch {
        stop();
        setStatus("failed");
        return;
      }

      if (isStopped) {
        return;
      }

      setStatus("scanning");
      await scan(video, detector);
    };

    void start();

    return stop;
  }, [attempt]);

  const hasProblem = status === "denied" || status === "failed";

  return (
    <Box sx={{ display: "grid", gap: 4 }}>
      {hasProblem && (
        <Alert severity="error">
          {status === "denied"
            ? "No pudimos acceder a la cámara. Permite su uso en los ajustes del navegador o escribe el ISBN a mano."
            : "No pudimos iniciar la cámara. Inténtalo de nuevo o escribe el ISBN a mano."}
        </Alert>
      )}

      <Box
        hidden={hasProblem}
        sx={{
          position: "relative",
          aspectRatio: "4 / 3",
          borderRadius: 1.5,
          overflow: "hidden",
          bgcolor: "common.black",
          display: hasProblem ? "none" : "block",
        }}
      >
        <Box
          component="video"
          ref={videoRef}
          playsInline
          muted
          autoPlay
          aria-label="Vista de la cámara"
          sx={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <Box
          aria-hidden="true"
          sx={{
            position: "absolute",
            inset: "25% 10%",
            border: 2,
            borderColor: "common.white",
            borderRadius: 1,
            pointerEvents: "none",
          }}
        />
      </Box>

      <Typography
        role="status"
        color="text.secondary"
        sx={{ textAlign: "center" }}
      >
        {status === "starting" && "Preparando la cámara…"}
        {status === "scanning" && "Apunta al código de barras del libro."}
      </Typography>

      {hasProblem && (
        <Box sx={{ display: "grid", gap: 3 }}>
          <Button fullWidth onClick={() => setAttempt((count) => count + 1)}>
            Reintentar
          </Button>
          <Button variant="text" fullWidth onClick={onWriteIsbn}>
            Escribir ISBN
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ScanStep;
