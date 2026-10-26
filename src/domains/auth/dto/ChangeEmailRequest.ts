// `POST /auth/me/email`: pide el cambio; no se aplica hasta confirmar el enlace
// enviado al email nuevo.
export interface ChangeEmailRequest {
  newEmail: string;
  currentPassword: string;
}
