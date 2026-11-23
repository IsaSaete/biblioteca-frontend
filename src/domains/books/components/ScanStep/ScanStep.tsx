import { useEffect, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import Button from "../../../../components/ui/Button/Button";
import { captureRegion } from "../../scanner/captureRegion";
import { extractIsbn } from "../../scanner/extractIsbn";
import {
  GUIDE_INSET_X_PERCENT,
  GUIDE_INSET_Y_PERCENT,
  VIEWFINDER_ASPECT_RATIO,
  getScanRegion,
} from "../../scanner/getScanRegion";
import { loadBarcodeDetector } from "../../scanner/loadBarcodeDetector";
import type { BarcodeReader } from "../../scanner/loadBarcodeDetector";

const SCAN_INTERVAL_MS = 250;
// Zoom digital: la vista se amplía y se lee solo la parte central. No da más
// detalle al código (eso depende de la resolución y de la distancia), pero deja
// ver si está enfocado y reduce lo que se analiza.
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;
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
// del libro y entrega su ISBN. Solo se analiza la zona del recuadro guía, a la
// resolución del vídeo, y no el fotograma entero. Al salir (o al leerlo) la
// cámara se apaga siempre.
const ScanStep = ({ onIsbnScanned, onWriteIsbn }: ScanStepProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onIsbnScannedRef = useRef(onIsbnScanned);
  const [status, setStatus] = useState<ScanStatus>("starting");
  const [attempt, setAttempt] = useState(0);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  // El bucle de lectura lee el zoom actual sin reiniciar la cámara.
  const zoomRef = useRef(MIN_ZOOM);

  useEffect(() => {
    onIsbnScannedRef.current = onIsbnScanned;
  }, [onIsbnScanned]);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

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
      const canvas = document.createElement("canvas");

      const tick = async () => {
        if (isStopped) {
          return;
        }

        try {
          const region = getScanRegion(
            video.videoWidth,
            video.videoHeight,
            zoomRef.current,
          );
          const source = region ? captureRegion(video, region, canvas) : video;
          const isbn = extractIsbn(await detector.detect(source));
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
          // La máxima resolución: las barras de un código pequeño solo se
          // distinguen si ocupan varios píxeles. `ideal` no falla: el
          // dispositivo da la más alta que admita.
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 3840 },
            height: { ideal: 2160 },
          },
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
          aspectRatio: VIEWFINDER_ASPECT_RATIO,
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
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${zoom})`,
            transformOrigin: "center",
          }}
        />
        <Box
          aria-hidden="true"
          sx={{
            position: "absolute",
            inset: `${GUIDE_INSET_Y_PERCENT}% ${GUIDE_INSET_X_PERCENT}%`,
            border: 2,
            borderColor: "common.white",
            borderRadius: 1,
            pointerEvents: "none",
          }}
        />
        <Box sx={{ position: "absolute", left: 0, right: 0, bottom: 0, px: 6 }}>
          <Slider
            aria-label="Zoom"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={ZOOM_STEP}
            value={zoom}
            onChange={(_event, value) =>
              setZoom(Array.isArray(value) ? (value[0] ?? MIN_ZOOM) : value)
            }
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value.toFixed(1)}×`}
            getAriaValueText={(value) => `${value.toFixed(1)} aumentos`}
            sx={{ color: "common.white" }}
          />
        </Box>
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
