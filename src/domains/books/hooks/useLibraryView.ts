import { useMeQuery, useUpdatePreferencesMutation } from "../../auth/authApi";
import type { LibraryView } from "../dto/LibraryView";

// La vista de Biblioteca vive en la cuenta (`user.preferences.libraryView`).
// Cambiarla se ve al instante; si el servidor falla, vuelve a la anterior.
export const useLibraryView = () => {
  const { data } = useMeQuery();
  const [updatePreferences] = useUpdatePreferencesMutation();
  const view: LibraryView = data?.user.preferences?.libraryView ?? "grid";

  const setView = (libraryView: LibraryView) =>
    void updatePreferences({ libraryView });

  return { view, setView };
};
