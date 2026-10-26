// Sombra de las portadas (sistema-diseno-visual.md, «Sombra de portadas»). Es la
// única sombra de contenido de la app: las portadas son objetos, el resto de la
// interfaz es plana.
//
// En claro, una sombra suave tintada con el marrón del texto. En oscuro no hay
// sombra difusa (sobre casi negro no se ve): un filete claro de 1px que define
// el borde de las portadas oscuras.
export const COVER_SHADOW = {
  light: {
    regular: "0 2px 8px 0 rgba(43, 38, 32, 0.2)",
    small: "0 1px 4px 0 rgba(43, 38, 32, 0.2)",
  },
  dark: "0 0 0 1px rgba(255, 255, 255, 0.1)",
} as const;
