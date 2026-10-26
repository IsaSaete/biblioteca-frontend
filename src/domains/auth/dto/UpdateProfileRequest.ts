// `PATCH /auth/me`: por ahora solo el nombre (el email y la contraseña tienen
// su propio endpoint).
export interface UpdateProfileRequest {
  name: string;
}
