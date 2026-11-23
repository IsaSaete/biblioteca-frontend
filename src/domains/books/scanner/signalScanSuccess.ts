// Confirma con el cuerpo y el oído, además de con lo que se ve, que el código se
// leyó. Cada vía depende del dispositivo y ninguna puede romper el escaneo.
//
// - Android (Chrome, Firefox): `navigator.vibrate`.
// - iPhone: ningún navegador de iOS la tiene. Se probó un truco no oficial (un
//   `<input type="checkbox" switch>` oculto, que iOS 17.4+ acompaña con un toque
//   háptico) y no funcionó en un iPhone real (D-070), así que se quitó.
// - Un pitido corto con Web Audio. En iOS solo suena si el contexto de audio
//   se desbloqueó con una interacción (por eso `primeScanFeedback`) y si el
//   interruptor de silencio no está activo.

const VIBRATION_MS = 80;
const BEEP_FREQUENCY_HZ = 880;
const BEEP_DURATION_S = 0.15;
const BEEP_VOLUME = 0.2;

let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (audioContext) {
    return audioContext;
  }

  if (typeof AudioContext === "undefined") {
    return null;
  }

  try {
    audioContext = new AudioContext();
  } catch {
    return null;
  }

  return audioContext;
};

const playBeep = (): void => {
  const context = getAudioContext();

  if (!context) {
    return;
  }

  const beep = () => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;

    oscillator.type = "sine";
    oscillator.frequency.value = BEEP_FREQUENCY_HZ;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(BEEP_VOLUME, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + BEEP_DURATION_S);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + BEEP_DURATION_S);
  };

  if (context.state === "running") {
    beep();
  } else {
    void context
      .resume()
      .then(beep)
      .catch(() => undefined);
  }
};

// Se llama al abrir el escáner, justo tras el toque del usuario: es el momento
// en que el navegador deja desbloquear el audio.
export const primeScanFeedback = (): void => {
  try {
    void getAudioContext()
      ?.resume()
      .catch(() => undefined);
  } catch {
    // Sin soporte: el escaneo funciona igual, solo sin estas señales.
  }
};

export const signalScanSuccess = (): void => {
  try {
    // Sin `navigator.vibrate` (iPhone) no hay vibración posible.
    if (typeof navigator.vibrate === "function") {
      navigator.vibrate(VIBRATION_MS);
    }
  } catch {
    // Bloqueada por el navegador: se sigue con el sonido.
  }

  try {
    playBeep();
  } catch {
    // Sin soporte o bloqueado por el navegador.
  }
};
