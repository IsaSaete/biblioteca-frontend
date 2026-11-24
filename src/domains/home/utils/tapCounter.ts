// Cuenta toques seguidos: avisa al llegar a `required` dentro de `windowMs`
// desde el primero. Función pura: recibe la hora en cada toque.
export const createTapCounter = (required: number, windowMs: number) => {
  let taps: number[] = [];

  return {
    // `true` cuando este toque completa la cuenta; empieza de nuevo después.
    register: (now: number): boolean => {
      taps = [...taps.filter((time) => now - time <= windowMs), now];

      if (taps.length >= required) {
        taps = [];
        return true;
      }

      return false;
    },
    reset: (): void => {
      taps = [];
    },
  };
};
