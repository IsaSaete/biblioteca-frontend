// La ventana de la cámara es 4:3 y el recuadro guía deja un margen alrededor.
// Estas medidas las usan tanto el dibujo del recuadro como el recorte que se
// analiza, para que lo que se ve dentro del recuadro sea justo lo que se lee.
export const VIEWFINDER_ASPECT_RATIO = 4 / 3;
export const GUIDE_INSET_X_PERCENT = 10;
export const GUIDE_INSET_Y_PERCENT = 25;

export interface ScanRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Zona del fotograma (en píxeles del vídeo) que queda dentro del recuadro guía
// con el zoom indicado. El vídeo se pinta con `object-fit: cover`, así que la
// ventana solo enseña el centro del fotograma; el recuadro está centrado en
// ella y el zoom reduce a su vez lo que cabe dentro. `null` mientras el vídeo
// aún no tiene tamaño.
export const getScanRegion = (
  videoWidth: number,
  videoHeight: number,
  zoom: number,
): ScanRegion | null => {
  if (videoWidth <= 0 || videoHeight <= 0) {
    return null;
  }

  const isWiderThanViewfinder =
    videoWidth / videoHeight > VIEWFINDER_ASPECT_RATIO;
  const visibleWidth = isWiderThanViewfinder
    ? videoHeight * VIEWFINDER_ASPECT_RATIO
    : videoWidth;
  const visibleHeight = isWiderThanViewfinder
    ? videoHeight
    : videoWidth / VIEWFINDER_ASPECT_RATIO;
  const factor = Math.max(1, zoom);
  const width = Math.round(
    (visibleWidth * (1 - (2 * GUIDE_INSET_X_PERCENT) / 100)) / factor,
  );
  const height = Math.round(
    (visibleHeight * (1 - (2 * GUIDE_INSET_Y_PERCENT) / 100)) / factor,
  );

  return {
    x: Math.round((videoWidth - width) / 2),
    y: Math.round((videoHeight - height) / 2),
    width,
    height,
  };
};
