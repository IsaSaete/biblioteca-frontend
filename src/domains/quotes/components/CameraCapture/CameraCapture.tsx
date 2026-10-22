import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "../../../../components/ui/Button/Button";
import { useCameraStream } from "../../../../hooks/useCameraStream";
import { getScaledSize } from "../../ocr/imageSize";

interface CameraCaptureProps {
  // Foto ya reducida para el OCR. Es transitoria: no se guarda en ninguna parte.
  onCapture: (image: HTMLCanvasElement) => void;
  onWrite: () => void;
}

// Visor de cámara para fotografiar un fragmento del libro (HU-24). Con la
// cámara denegada o sin poder abrirla, nunca deja al usuario atascado: ofrece
// reintentar o escribir la cita a mano.
const CameraCapture = ({ onCapture, onWrite }: CameraCaptureProps) => {
  const { videoRef, status, retry } = useCameraStream();
  const hasProblem = status === "denied" || status === "failed";

  const capture = () => {
    const video = videoRef.current;
    const size = getScaledSize(video?.videoWidth ?? 0, video?.videoHeight ?? 0);
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext("2d");

    if (!video || !context || size.width === 0) {
      return;
    }

    context.drawImage(video, 0, 0, size.width, size.height);
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
          maxHeight: "55dvh",
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
      </Box>

      <Typography
        role="status"
        color="text.secondary"
        sx={{ textAlign: "center" }}
      >
        {status === "starting" && "Preparando la cámara…"}
        {status === "ready" && "Encuadra el texto de la cita y pulsa Capturar."}
      </Typography>

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
