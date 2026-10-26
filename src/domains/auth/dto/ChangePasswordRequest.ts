// `POST /auth/me/password`.
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
