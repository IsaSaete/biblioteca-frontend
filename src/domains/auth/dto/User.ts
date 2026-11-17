import type { UserPreferences } from "./UserPreferences";

export interface User {
  id: string;
  name: string;
  email: string;
  // `false`: el correo aún no se ha verificado (se avisa en Perfil). Ausente se
  // trata como verificado: no se muestra ningún aviso.
  emailVerified?: boolean;
  // Opcional mientras el backend no devuelva el campo (D-016): ausente se trata
  // como «ya visto» y solo `false` redirige al onboarding.
  onboardingCompleted?: boolean;
  // Opcional mientras el backend no devuelva el campo (D-029): ausente se
  // trata como la vista de cuadrícula.
  preferences?: UserPreferences;
  // `null` o ausente: sin foto; si no, la ruta de la foto con su marca de
  // tiempo (`/api/auth/me/avatar?v=…`).
  avatarUrl?: string | null;
}
