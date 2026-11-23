export type ConfirmBookMode = "wishlist";

// Qué enseña y qué hace la confirmación en cada caso: biblioteca, lista de
// deseos y, con cualquiera de las dos, el alta manual. Un ISBN identifica una
// edición concreta, así que sus datos solo se confirman: se corrigen después,
// en el editor del libro. Es la única función que
// conoce los modos: el resto de piezas leen esta configuración y no preguntan
// «¿es lista de deseos?». Un modo nuevo es una entrada nueva aquí, no una
// edición de cada pieza.
export interface ConfirmBookVariant {
  // La portada solo tiene sentido si hay datos de un catálogo que confirmar.
  showsCover: boolean;
  // Debajo de los datos: el estado de lectura (biblioteca) o la nota (deseos).
  extra: "status" | "note";
  // «Más detalles» (año, idioma, páginas) solo se rellena en el alta manual: un
  // libro de catálogo ya los trae.
  showsDetails: boolean;
  // A dónde va el botón principal; en biblioteca se ofrece además el acceso
  // directo a la lista de deseos.
  submitsTo: "library" | "wishlist";
}

export const getConfirmBookVariant = (
  mode: ConfirmBookMode | undefined,
  isManual: boolean,
): ConfirmBookVariant => {
  const isWishlist = mode === "wishlist";

  return {
    showsCover: !isManual,
    extra: isWishlist ? "note" : "status",
    showsDetails: isManual,
    submitsTo: isWishlist ? "wishlist" : "library",
  };
};
