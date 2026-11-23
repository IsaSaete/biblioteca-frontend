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
import {
  primeScanFeedback,
  signalScanSuccess,
} from "../../scanner/signalScanSuccess";

const SCAN_INTERVAL_MS = 250;
// Si pasado este tiempo no se ha leído nada, se sugiere qué probar.
const SLOW_HINT_DELAY_MS = 8000;
// Cuánto se mantiene el aviso de «es un código, pero no un ISBN» tras verlo.
const OTHER_CODE_NOTICE_MS = 3000;
// Cuánto se enseña el «código leído» antes de pasar al paso siguiente.
const FOUND_DELAY_MS = 450;
// Zoom digital: la vista se amplía y se lee solo la parte central. No da más
// detalle al código (eso depende de la resolución y de la distancia), pero deja
// ver si está enfocado y reduce lo que se analiza.
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;
// Un ISBN solo se da por bueno si se lee igual en lecturas seguidas: evita
// consultar con una lectura suelta de un fotograma movido.
const REQUIRED_CONSECUTIVE_READS = 2;

type ScanStatus = "starting" | "scanning" | "found" | "denied" | "failed";

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
  const [sawOtherCode, setSawOtherCode] = useState(false);
  const [isSlow, setIsSlow] = useState(false);
  // El bucle de lectura lee el zoom actual sin reiniciar la cámara.
  const zoomRef = useRef(MIN_ZOOM);

  useEffect(() => {
    onIsbnScannedRef.current = onIsbnScanned;
  }, [onIsbnScanned]);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  // Al abrir, justo tras el toque que llevó hasta aquí: es cuando el navegador
  // deja desbloquear el audio y dejar a punto la señal háptica.
  useEffect(() => {
    primeScanFeedback();
  }, []);

  useEffect(() => {
    let isStopped = false;
    let stream: MediaStream | null = null;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let otherCodeTimer: ReturnType<typeof setTimeout> | undefined;
    let slowTimer: ReturnType<typeof setTimeout> | undefined;
    let foundTimer: ReturnType<typeof setTimeout> | undefined;

    const stop = () => {
      isStopped = true;
      clearTimeout(timeout);
      clearTimeout(otherCodeTimer);
      clearTimeout(slowTimer);
      clearTimeout(foundTimer);
      stream?.getTracks().forEach((track) => track.stop());
    };

    // Deja de leer, pero la cámara sigue encendida un instante: se ve el
    // recuadro en verde y se confirma con vibración y sonido antes de pasar al
    // paso siguiente, para que no quede duda de que se leyó.
    const confirmRead = (isbn: string) => {
      isStopped = true;
      clearTimeout(timeout);
      clearTimeout(otherCodeTimer);
      clearTimeout(slowTimer);
      setSawOtherCode(false);
      setStatus("found");
      signalScanSuccess();
      foundTimer = setTimeout(() => {
        stop();
        onIsbnScannedRef.current(isbn);
      }, FOUND_DELAY_MS);
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
          const barcodes = await detector.detect(source);
          const isbn = extractIsbn(barcodes);

          // La cámara lee, pero ese código no es el ISBN: se lo decimos para
          // que no piense que no funciona.
          if (isbn === null && barcodes.length > 0 && !isStopped) {
            setSawOtherCode(true);
            clearTimeout(otherCodeTimer);
            otherCodeTimer = setTimeout(
              () => setSawOtherCode(false),
              OTHER_CODE_NOTICE_MS,
            );
          }

          reads = isbn !== null && isbn === lastIsbn ? reads + 1 : isbn ? 1 : 0;
          lastIsbn = isbn;

          if (isbn !== null && reads >= REQUIRED_CONSECUTIVE_READS) {
            confirmRead(isbn);
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
      setIsSlow(false);

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
      slowTimer = setTimeout(() => setIsSlow(true), SLOW_HINT_DELAY_MS);
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
            borderColor: status === "found" ? "success.main" : "common.white",
            borderRadius: 1,
            pointerEvents: "none",
          }}
        />
        {status === "found" && (
          <Box
            aria-hidden="true"
            sx={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              pointerEvents: "none",
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                bgcolor: "success.main",
                color: "success.contrastText",
                display: "grid",
                placeItems: "center",
              }}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </Box>
          </Box>
        )}
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
            disabled={status === "found"}
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
        {status === "found" && "Código leído."}
        {status === "scanning" &&
          (sawOtherCode
            ? "Veo un código, pero no es el ISBN del libro: busca el que empieza por 978 o 979."
            : isSlow
              ? "¿Cuesta leerlo? Prueba con más luz, ajusta la distancia o el zoom, o escribe el ISBN."
              : "Apunta al código de barras del libro.")}
      </Typography>

      <Box sx={{ display: "grid", gap: 3 }}>
        {hasProblem && (
          <Button fullWidth onClick={() => setAttempt((count) => count + 1)}>
            Reintentar
          </Button>
        )}
        {/* Siempre a mano: si el código no se lee, hay salida sin salir del paso. */}
        <Button variant="text" fullWidth onClick={onWriteIsbn}>
          Escribir ISBN
        </Button>
      </Box>
    </Box>
  );
};

export default ScanStep;
