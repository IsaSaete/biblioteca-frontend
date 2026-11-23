// Confirma con el cuerpo, además de con lo que se ve, que el código se leyó.
// Cada vía depende del dispositivo y ninguna puede romper el escaneo.
//
// - Android (Chrome, Firefox): `navigator.vibrate`.
// - iPhone: ningún navegador de iOS tiene `navigator.vibrate`. Se prueba un
//   truco NO oficial: un interruptor `<input type="checkbox" switch>` oculto,
//   que iOS 17.4 o superior acompaña con un toque háptico al activarse. Puede no
//   funcionar si el sistema exige un toque reciente del usuario.
// - Un pitido corto con Web Audio. En iOS solo suena si el contexto de audio
//   se desbloqueó con una interacción (por eso `primeScanFeedback`) y si el
//   interruptor de silencio no está activo.

const VIBRATION_MS = 80;
const BEEP_FREQUENCY_HZ = 880;
const BEEP_DURATION_S = 0.15;
const BEEP_VOLUME = 0.2;

let audioContext: AudioContext | null = null;
let hapticSwitch: HTMLInputElement | null = null;

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

const getHapticSwitch = (): HTMLInputElement => {
  if (hapticSwitch?.isConnected) {
    return hapticSwitch;
  }

  const input = document.createElement("input");
  input.type = "checkbox";
  input.setAttribute("switch", "");
  input.tabIndex = -1;

  // Fuera de pantalla y sin que nada lo toque: solo existe para que el sistema
  // note que se activa.
  const label = document.createElement("label");
  label.setAttribute("aria-hidden", "true");
  Object.assign(label.style, {
    position: "fixed",
    left: "-9999px",
    top: "0",
    opacity: "0",
    pointerEvents: "none",
  });
  label.appendChild(input);
  document.body.appendChild(label);
  hapticSwitch = input;

  return input;
};

const tapHaptic = (): void => {
  getHapticSwitch().parentElement?.click();
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
// en que el navegador deja desbloquear el audio, y el interruptor háptico ya
// está en la página cuando haga falta.
export const primeScanFeedback = (): void => {
  try {
    getHapticSwitch();
    void getAudioContext()
      ?.resume()
      .catch(() => undefined);
  } catch {
    // Sin soporte: el escaneo funciona igual, solo sin estas señales.
  }
};

export const signalScanSuccess = (): void => {
  try {
    if (typeof navigator.vibrate === "function") {
      navigator.vibrate(VIBRATION_MS);
    } else {
      tapHaptic();
    }
  } catch {
    // Sin soporte: se sigue con el sonido.
  }

  try {
    playBeep();
  } catch {
    // Sin soporte o bloqueado por el navegador.
  }
};
