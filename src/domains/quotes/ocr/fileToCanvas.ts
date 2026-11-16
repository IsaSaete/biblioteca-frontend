import { getScaledSize } from "./imageSize";

// Una foto de móvil o de cámara puede pesar decenas de megapíxeles: se acota el
// lado mayor al cargarla para no agotar la memoria. Es bastante mayor que el
// límite del OCR (`MAX_OCR_SIDE`) porque el recorte se hace sobre este canvas y
// solo después se reduce.
export const MAX_UPLOAD_SIDE = 3000;

// Pasa la foto elegida (desde el ordenador) a un canvas en memoria, respetando
// la orientación con la que se hizo, igual que la captura de la cámara. La foto
// nunca sale del dispositivo: se lee, se recorta y se descarta.
export const fileToCanvas = async (file: File): Promise<HTMLCanvasElement> => {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });

  try {
    const size = getScaledSize(bitmap.width, bitmap.height, MAX_UPLOAD_SIDE);
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("No se pudo preparar la imagen");
    }

    context.drawImage(bitmap, 0, 0, size.width, size.height);

    return canvas;
  } finally {
    bitmap.close();
  }
};
