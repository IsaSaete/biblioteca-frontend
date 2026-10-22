import { useEffect, useRef, useState } from "react";

export type CameraStatus = "starting" | "ready" | "denied" | "failed";

const isPermissionError = (error: unknown): boolean =>
  error instanceof DOMException &&
  (error.name === "NotAllowedError" || error.name === "SecurityError");

// Abre la cámara trasera en un `<video>` y la apaga siempre al salir. `retry`
// vuelve a pedirla (por ejemplo, tras conceder el permiso).
export const useCameraStream = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<CameraStatus>("starting");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isStopped = false;
    let stream: MediaStream | null = null;

    const stop = () => {
      isStopped = true;
      stream?.getTracks().forEach((track) => track.stop());
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
      setStatus("ready");
    };

    void start();

    return stop;
  }, [attempt]);

  return {
    videoRef,
    status,
    retry: () => setAttempt((count) => count + 1),
  };
};
