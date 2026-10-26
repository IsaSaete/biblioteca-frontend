import type { LibraryView } from "../../../books/dto/LibraryView";
import { useLibraryView } from "../../../books/hooks/useLibraryView";
import PreferenceSelector from "../PreferenceSelector/PreferenceSelector";

const options: { value: LibraryView; label: string }[] = [
  { value: "grid", label: "Cuadrícula" },
  { value: "list", label: "Lista" },
];

// Misma preferencia que el botón de la barra de Biblioteca (D-029): viaja con la
// cuenta, así que elegirla aquí o allí es lo mismo.
const LibraryViewSelector = () => {
  const { view, setView } = useLibraryView();

  return (
    <PreferenceSelector
      label="Vista de biblioteca"
      options={options}
      value={view}
      onChange={setView}
    />
  );
};

export default LibraryViewSelector;
