export type MotionPermission = "granted" | "denied" | "unsupported";

interface MotionEventWithPermission {
  requestPermission?: () => Promise<"granted" | "denied">;
}

// En iPhone (Safari 14.5 o superior) el movimiento exige un permiso que solo se
// puede pedir desde un toque: esta función hay que llamarla directamente desde
// el manejador del toque, no después de esperar otra cosa. Si se cancela el
// aviso no se puede volver a pedir hasta recargar. En Android no se pregunta.
export const requestMotionPermission = async (): Promise<MotionPermission> => {
  if (typeof DeviceMotionEvent === "undefined") {
    return "unsupported";
  }

  const { requestPermission } =
    DeviceMotionEvent as unknown as MotionEventWithPermission;

  if (typeof requestPermission !== "function") {
    return "granted";
  }

  try {
    return await requestPermission.call(DeviceMotionEvent);
  } catch {
    return "denied";
  }
};
