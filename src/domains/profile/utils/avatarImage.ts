// La foto de perfil se reduce en el cliente a un cuadrado de 256×256 JPEG
// (D-032): el servidor solo admite JPEG de hasta 200 KB.
export const AVATAR_SIZE = 256;
const MAX_BYTES = 200 * 1024;
const QUALITIES = [0.85, 0.7, 0.5];

export interface CoverCrop {
  x: number;
  y: number;
  size: number;
}

// El cuadrado centrado más grande que cabe en la imagen (recorte «cover»).
export const getCoverCrop = (width: number, height: number): CoverCrop => {
  const size = Math.min(width, height);

  return { x: (width - size) / 2, y: (height - size) / 2, size };
};

const toJpeg = (canvas: HTMLCanvasElement, quality: number): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("No se pudo crear la imagen")),
      "image/jpeg",
      quality,
    );
  });

// Lee la imagen elegida (respetando la orientación de la cámara), la recorta al
// centro y la comprime hasta que cabe en el límite del servidor.
export const resizeToAvatarJpeg = async (file: File): Promise<Blob> => {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });
  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("No se pudo preparar la imagen");
  }

  const crop = getCoverCrop(bitmap.width, bitmap.height);
  context.drawImage(
    bitmap,
    crop.x,
    crop.y,
    crop.size,
    crop.size,
    0,
    0,
    AVATAR_SIZE,
    AVATAR_SIZE,
  );
  bitmap.close();

  let blob = await toJpeg(canvas, QUALITIES[0]);

  for (const quality of QUALITIES.slice(1)) {
    if (blob.size <= MAX_BYTES) {
      break;
    }
    blob = await toJpeg(canvas, quality);
  }

  return blob;
};
