// Oculta un elemento a la vista pero lo deja disponible para lectores de
// pantalla. Ojo: en `sx` de MUI, `width: 1` significa 100%, no 1 píxel; por eso
// los valores van en píxeles. Un elemento "oculto" de 100% x 100% amplía el
// área desplazable de la página y provoca barras de scroll.
export const visuallyHidden = {
  border: 0,
  clip: "rect(0 0 0 0)",
  height: "1px",
  margin: "-1px",
  overflow: "hidden",
  padding: 0,
  position: "absolute",
  whiteSpace: "nowrap",
  width: "1px",
} as const;
