import type { LibraryView } from "../../books/dto/LibraryView";

// Preferencias de la cuenta (`user.preferences`, api-contract.md). El tema no
// está aquí: lo guarda el navegador.
export interface UserPreferences {
  libraryView: LibraryView;
}
