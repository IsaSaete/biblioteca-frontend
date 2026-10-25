// Texto del botón principal de la pantalla Filtros, con el recuento en vivo de
// los libros que quedarían con lo elegido (`undefined` mientras se calcula).
export const getShowLabel = (total: number | undefined): string => {
  if (total === undefined) {
    return "Ver libros";
  }
  if (total === 0) {
    return "Ningún libro coincide";
  }

  return total === 1 ? "Ver 1 libro" : `Ver ${total} libros`;
};
