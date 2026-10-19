import type { User } from "./User";

// Respuesta de login y de /auth/me: { user }.
export interface SessionResponse {
  user: User;
}
