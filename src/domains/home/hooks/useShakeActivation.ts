import { useRef, useState } from "react";
import { requestMotionPermission } from "../../../utils/motionPermission";
import { writeShakeSetting } from "../utils/shakeSetting";
import { createTapCounter } from "../utils/tapCounter";

const REQUIRED_TAPS = 5;
const TAP_WINDOW_MS = 3000;

// El secreto (D-071): pulsar cinco veces seguidas «Biblioteca» en la barra
// inferior activa el huevo de Pascua de agitar el móvil. Es el toque que
// permite pedir el permiso de movimiento en iPhone, que solo se puede pedir
// desde un toque. Pulsar otra sección empieza la cuenta de nuevo.
export const useShakeActivation = () => {
  const counter = useRef(createTapCounter(REQUIRED_TAPS, TAP_WINDOW_MS));
  const [notice, setNotice] = useState<string | null>(null);

  const handleNavTap = (itemId: string): void => {
    if (itemId !== "library") {
      counter.current.reset();
      return;
    }

    if (!counter.current.register(Date.now())) {
      return;
    }

    // Se llama aquí mismo, dentro del toque: más tarde ya no se concedería.
    void requestMotionPermission().then((permission) => {
      if (permission === "granted") {
        writeShakeSetting(true);
        setNotice("¡Has encontrado un secreto! Ve a Inicio y agita el móvil.");
      } else if (permission === "denied") {
        setNotice(
          "No he podido activarlo: falta el permiso para notar el movimiento.",
        );
      } else {
        setNotice("Este dispositivo no sabe notar el movimiento.");
      }
    });
  };

  return { handleNavTap, notice, clearNotice: () => setNotice(null) };
};
