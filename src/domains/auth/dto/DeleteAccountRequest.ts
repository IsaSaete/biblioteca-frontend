// `DELETE /auth/me`: borra la cuenta y todos sus datos; pide la contraseña.
export interface DeleteAccountRequest {
  password: string;
}
