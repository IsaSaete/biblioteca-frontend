// Aplica el modo de color guardado antes del primer pintado, para evitar el
// parpadeo de claro a oscuro. Es un archivo externo y no un script en línea
// porque la CSP (script-src 'self') bloquea los scripts en línea.
// Debe coincidir con lo que usa MUI con `colorSchemeSelector: "data"`: la
// clave "mui-mode" de localStorage y los atributos `data-light` / `data-dark`.
(function () {
  try {
    var mode = localStorage.getItem("mui-mode") || "system";
    var scheme =
      mode === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : mode;
    var root = document.documentElement;
    root.removeAttribute("data-light");
    root.removeAttribute("data-dark");
    root.setAttribute("data-" + scheme, "");
  } catch (error) {
    // Sin almacenamiento disponible se usa el modo del sistema que aplica MUI.
  }
})();
