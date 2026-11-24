import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "../../../../components/ui/Button/Button";
import Pill from "../../../../components/ui/Pill/Pill";
import { useCameraStream } from "../../../../hooks/useCameraStream";
import { useDeviceOrientation } from "../../../../hooks/useDeviceOrientation";
import { requestMotionPermission } from "../../../../utils/motionPermission";
import { visuallyHidden } from "../../../../utils/visuallyHidden";
import { getVisibleRegion } from "../../ocr/imageSize";
import { getTiltOffset } from "../../utils/getTiltOffset";
import LevelGuide from "../LevelGuide/LevelGuide";

// Tiempo que se espera la primera lectura de inclinación antes de dar el nivel
// por imposible.
const NO_READING_TIMEOUT_MS = 1500;

interface CameraCaptureProps {
  // Foto del encuadre, a la resolución de la cámara (se recorta y se reduce
  // después). Es transitoria: no se guarda en ninguna parte.
  onCapture: (image: HTMLCanvasElement) => void;
  onWrite: () => void;
}

// Visor de cámara para fotografiar un fragmento del libro (HU-24). Con la
// cámara denegada o sin poder abrirla, nunca deja al usuario atascado: ofrece
// reintentar o escribir la cita a mano. Un botón «Nivel» opcional dibuja una
// burbuja para ver si el móvil está recto: el texto torcido o en perspectiva se
// lee peor.
const CameraCapture = ({ onCapture, onWrite }: CameraCaptureProps) => {
  const { videoRef, status, retry } = useCameraStream();
  const hasProblem = status === "denied" || status === "failed";
  const [isLevelOn, setIsLevelOn] = useState(false);
  const [levelNotice, setLevelNotice] = useState<string | null>(null);
  const orientation = useDeviceOrientation(isLevelOn);
  const tilt = orientation ? getTiltOffset(orientation) : null;
  const hasReading = orientation !== null;

  // Un ordenador no tiene sensor de inclinación (y un móvil sin permiso tampoco
  // da lecturas): si no llega ninguna, se dice en vez de quedarse mudo.
  useEffect(() => {
    if (!isLevelOn || hasReading) {
      return;
    }

    const timer = setTimeout(() => {
      setIsLevelOn(false);
      setLevelNotice(
        "No recibo la inclinación de este dispositivo: el nivel no puede funcionar aquí.",
      );
    }, NO_READING_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [isLevelOn, hasReading]);

  // El permiso de inclinación en iPhone solo se puede pedir desde el toque.
  const toggleLevel = () => {
    if (isLevelOn) {
      setIsLevelOn(false);
      return;
    }

    void requestMotionPermission("orientation").then((permission) => {
      if (permission === "granted") {
        setLevelNotice(null);
        setIsLevelOn(true);
      } else {
        setLevelNotice(
          permission === "denied"
            ? "Sin permiso para notar la inclinación, el nivel no puede funcionar."
            : "Este dispositivo no tiene sensor de inclinación.",
        );
      }
    });
  };

  const capture = () => {
    const video = videoRef.current;
    // Solo se lee lo que el visor deja ver, no el fotograma entero.
    const region = getVisibleRegion(
      video?.videoWidth ?? 0,
      video?.videoHeight ?? 0,
      video?.clientWidth ?? 0,
      video?.clientHeight ?? 0,
    );
    const canvas = document.createElement("canvas");
    canvas.width = region.width;
    canvas.height = region.height;
    const context = canvas.getContext("2d");

    if (!video || !context || region.width === 0) {
      return;
    }

    context.drawImage(
      video,
      region.x,
      region.y,
      region.width,
      region.height,
      0,
      0,
      region.width,
      region.height,
    );
    onCapture(canvas);
  };

  return (
    <Box sx={{ display: "grid", gap: 4 }}>
      {hasProblem && (
        <Alert severity="error">
          {status === "denied"
            ? "No pudimos acceder a la cámara. Permite su uso en los ajustes del navegador o escribe la cita a mano."
            : "No pudimos iniciar la cámara. Inténtalo de nuevo o escribe la cita a mano."}
        </Alert>
      )}

      <Box
        sx={{
          aspectRatio: "3 / 4",
          // El botón «Capturar» debe verse sin hacer scroll en pantallas bajas.
          // El alto máximo se pasa al ancho (3/4 del alto) para que la caja
          // conserve su proporción, ocupe todo el ancho posible y quede
          // centrada, en vez de encogerse hacia un lado.
          width: "100%",
          maxWidth: "calc(55dvh * 3 / 4)",
          mx: "auto",
          position: "relative",
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
        {tilt && <LevelGuide tilt={tilt} />}
        {status === "ready" && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: "background.paper",
              borderRadius: "999px",
            }}
          >
            <Pill label="Nivel" selected={isLevelOn} onClick={toggleLevel} />
          </Box>
        )}
      </Box>
      {/* Solo se anuncia al lector de pantalla cuando se consigue el nivel. */}
      <Box role="status" sx={visuallyHidden}>
        {tilt?.isLevel ? "Nivelado." : ""}
      </Box>

      <Typography
        role="status"
        color="text.secondary"
        sx={{ textAlign: "center" }}
      >
        {status === "starting" && "Preparando la cámara…"}
        {status === "ready" && "Encuadra el texto de la cita y pulsa Capturar."}
      </Typography>
      {levelNotice && (
        <Typography
          color="text.secondary"
          sx={{ textAlign: "center", fontSize: "0.875rem" }}
        >
          {levelNotice}
        </Typography>
      )}
      {!hasProblem && (
        <Typography
          color="text.secondary"
          sx={{ textAlign: "center", fontSize: "0.875rem" }}
        >
          Se lee mejor con buena luz, sin sombras y con el libro recto. El
          subrayado a lápiz confunde al lector: revisa el texto después.
        </Typography>
      )}

      {hasProblem ? (
        <Box sx={{ display: "grid", gap: 3 }}>
          <Button fullWidth onClick={retry}>
            Reintentar
          </Button>
          <Button variant="text" fullWidth onClick={onWrite}>
            Escribir a mano
          </Button>
        </Box>
      ) : (
        <Button fullWidth disabled={status !== "ready"} onClick={capture}>
          Capturar
        </Button>
      )}
    </Box>
  );
};

export default CameraCapture;
