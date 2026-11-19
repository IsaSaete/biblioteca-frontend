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

// Cuando Google Books no tiene una portada (o no en la medida pedida) no da
// error: responde 200 con un PNG «image not available». Medidas comprobadas:
// 575 × 750 (ficha sin imagen, en zoom 2 y 3), 300 × 391 (ficha con miniatura
// pero sin la medida mediana) y 128 × 170 (ficha sin imagen, en zoom 1). Los
// dos primeros tienen la misma proporción (23:30), que casi ninguna portada real
// tiene; el de 128 × 170 solo se reconoce por su medida exacta.
const NOT_AVAILABLE_RATIO = 575 / 750;
const RATIO_TOLERANCE = 0.002;
const SMALL_NOT_AVAILABLE = { width: 128, height: 170 };

// ¿La imagen cargada es el «image not available» de Google? `isEnlarged` indica
// que es la medida ampliada: ahí basta la proporción, porque si es una portada
// real con esa proporción se cae a la original, que se ve igual de bien. En la
// original solo se descarta la medida exacta, para no esconder portadas reales.
export const isGoogleNotAvailable = (
  width: number,
  height: number,
  isEnlarged: boolean,
): boolean => {
  if (width <= 0 || height <= 0) {
    return false;
  }

  if (isEnlarged) {
    return Math.abs(width / height - NOT_AVAILABLE_RATIO) <= RATIO_TOLERANCE;
  }

  return (
    width === SMALL_NOT_AVAILABLE.width && height === SMALL_NOT_AVAILABLE.height
  );
};
