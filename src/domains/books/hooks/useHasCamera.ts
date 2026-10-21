import { useEffect, useState } from "react";

// ¿Hay una cámara que usar? Se mira la disponibilidad real (API `mediaDevices`,
// que además solo existe en HTTPS), no el ancho de la pantalla: hay portátiles
// con cámara y móviles sin permiso (pantallas-y-flujos.md, «adaptación a
// escritorio»). Hasta saberlo, o si no hay, devuelve `false`.
export const useHasCamera = (): boolean => {
  const [hasCamera, setHasCamera] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    const devices = navigator.mediaDevices as MediaDevices | undefined;

    if (!devices?.getUserMedia || !devices.enumerateDevices) {
      return;
    }

    devices
      .enumerateDevices()
      .then((list) => {
        if (!isCancelled) {
          setHasCamera(list.some(({ kind }) => kind === "videoinput"));
        }
      })
      .catch(() => undefined);

    return () => {
      isCancelled = true;
    };
  }, []);

  return hasCamera;
};
