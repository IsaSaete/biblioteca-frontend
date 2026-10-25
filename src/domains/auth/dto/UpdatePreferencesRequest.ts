import type { UserPreferences } from "./UserPreferences";

// `PATCH /auth/me/preferences`: solo cambia lo que se envía.
export type UpdatePreferencesRequest = Partial<UserPreferences>;
