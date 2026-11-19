// Los proveedores devuelven por defecto la miniatura más pequeña (128 px en
// Google Books, 180 px en Open Library) y en una pantalla retina se ve
// pixelada. Aquí se pide la siguiente medida (≈300 y ≈335 px de ancho) sin
// tocar lo guardado: sirve también para los libros que ya existen.
const GOOGLE_HOST = "books.google.com";
const OPEN_LIBRARY_HOST = "covers.openlibrary.org";
const GOOGLE_ZOOM = "2";

const enlargeOpenLibrary = (url: URL): void => {
  url.pathname = url.pathname.replace(/-[SM](\.jpg)$/, "-L$1");
};

const enlargeGoogle = (url: URL): void => {
  const zoom = url.searchParams.get("zoom");

  if (zoom === null || zoom === "1") {
    url.searchParams.set("zoom", GOOGLE_ZOOM);
  }

  // `edge=curl` dibuja una esquina doblada sobre la portada.
  url.searchParams.delete("edge");
};

// Devuelve la URL de la portada en una medida mayor si el proveedor es
// conocido; cualquier otra se deja tal cual. Una URL que no se puede leer
// también.
export const coverImageUrl = (coverUrl: string): string => {
  let url: URL;

  try {
    url = new URL(coverUrl);
  } catch {
    return coverUrl;
  }

  if (url.hostname === OPEN_LIBRARY_HOST) {
    enlargeOpenLibrary(url);
  } else if (url.hostname === GOOGLE_HOST) {
    enlargeGoogle(url);
  } else {
    return coverUrl;
  }

  // La CSP solo admite imágenes por https: Google devuelve a veces http.
  url.protocol = "https:";

  return url.toString();
};
