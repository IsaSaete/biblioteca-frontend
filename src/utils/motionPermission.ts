export type MotionPermission = "granted" | "denied" | "unsupported";

// Qué sensor se quiere leer: el movimiento (acelerómetro, para agitar) o la
// orientación (inclinación, para el nivel).
export type MotionKind = "motion" | "orientation";

interface EventWithPermission {
  requestPermission?: () => Promise<"granted" | "denied">;
}

// En iPhone (Safari 14.5 o superior) el movimiento y la orientación exigen un
// permiso que solo se puede pedir desde un toque: esta función hay que llamarla
// directamente desde el manejador del toque, no después de esperar otra cosa.
// Si se cancela el aviso no se puede volver a pedir hasta recargar, y dura solo
// hasta cerrar la aplicación. En Android no se pregunta.
export const requestMotionPermission = async (
  kind: MotionKind = "motion",
): Promise<MotionPermission> => {
  const eventClass: unknown =
    kind === "motion"
      ? typeof DeviceMotionEvent === "undefined"
        ? undefined
        : DeviceMotionEvent
      : typeof DeviceOrientationEvent === "undefined"
        ? undefined
        : DeviceOrientationEvent;

  if (!eventClass) {
    return "unsupported";
  }

  const { requestPermission } = eventClass as EventWithPermission;

  if (typeof requestPermission !== "function") {
    return "granted";
  }

  try {
    return await requestPermission.call(eventClass);
  } catch {
    return "denied";
  }
};
