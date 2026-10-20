export interface User {
  id: string;
  name: string;
  email: string;
  // Opcional mientras el backend no devuelva el campo (D-016): ausente se trata
  // como «ya visto» y solo `false` redirige al onboarding.
  onboardingCompleted?: boolean;
}
