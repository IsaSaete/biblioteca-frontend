const KEY = "glosa.shake";

// Si el huevo de Pascua de agitar el móvil está activado en este dispositivo.
// Va en el navegador, no en la cuenta: el permiso de movimiento también es del
// dispositivo.
export const readShakeSetting = (): boolean => {
  try {
    return localStorage.getItem(KEY) === "on";
  } catch {
    return false;
  }
};

export const writeShakeSetting = (isOn: boolean): void => {
  try {
    if (isOn) {
      localStorage.setItem(KEY, "on");
    } else {
      localStorage.removeItem(KEY);
    }
  } catch {
    // Sin almacenamiento (ventana privada): se pierde al recargar, sin más.
  }
};
