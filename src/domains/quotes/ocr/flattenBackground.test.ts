import { flattenBackground } from "./flattenBackground";
import type { PixelImage } from "./flattenBackground";

const buildImage = (
  width: number,
  height: number,
  grayAt: (x: number, y: number) => number,
): PixelImage => {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      const value = grayAt(x, y);
      data[offset] = value;
      data[offset + 1] = value;
      data[offset + 2] = value;
      data[offset + 3] = 255;
    }
  }
  return { data, width, height };
};

const levelAt = (image: PixelImage, x: number, y: number): number =>
  image.data[(y * image.width + x) * 4] ?? -1;

describe("Given a photo of a page with a dark ink mark", () => {
  describe("When the background is flattened", () => {
    it("Then the paper turns white and the ink turns dark", () => {
      const image = buildImage(40, 40, (x, y) =>
        x >= 18 && x < 22 && y >= 10 && y < 30 ? 30 : 200,
      );

      flattenBackground(image);

      expect(levelAt(image, 2, 2)).toBe(255);
      expect(levelAt(image, 20, 20)).toBeLessThan(40);
    });
  });

  describe("When one side of the page is in shadow", () => {
    it("Then the paper is white on both sides and the ink stays dark in the shadow", () => {
      // Degradado de sombra de 220 (izquierda) a 90 (derecha), con una marca
      // de tinta en la zona oscura.
      const image = buildImage(80, 40, (x, y) => {
        const paper = 220 - (130 * x) / 79;
        return x >= 60 && x < 64 && y >= 10 && y < 30 ? paper * 0.3 : paper;
      });

      flattenBackground(image);

      expect(levelAt(image, 5, 5)).toBeGreaterThan(240);
      expect(levelAt(image, 75, 5)).toBeGreaterThan(240);
      expect(levelAt(image, 62, 20)).toBeLessThan(60);
    });
  });

  describe("When the text is light on a dark background (a black back cover)", () => {
    it("Then the background turns white and the text turns dark, instead of vanishing", () => {
      const image = buildImage(60, 40, (x, y) =>
        x >= 28 && x < 32 && y >= 10 && y < 30 ? 150 : 20,
      );

      flattenBackground(image);

      expect(levelAt(image, 3, 3)).toBe(255);
      expect(levelAt(image, 30, 20)).toBeLessThan(40);
    });

    it("Then it still works when the light text is grey and has little contrast", () => {
      const image = buildImage(60, 40, (x, y) =>
        x >= 28 && x < 32 && y >= 10 && y < 30 ? 105 : 25,
      );

      flattenBackground(image);

      // Con tan poco contraste el texto no queda negro, sino gris medio: lo que
      // importa es que se distinga del fondo.
      expect(levelAt(image, 3, 3)).toBe(255);
      expect(levelAt(image, 30, 20)).toBeLessThan(160);
    });

    it("Then it works with a light falloff across the dark background", () => {
      // Fondo que pasa de 10 a 70, con trazo claro en la zona más iluminada.
      const image = buildImage(80, 40, (x, y) => {
        const background = 10 + (60 * x) / 79;
        return x >= 60 && x < 64 && y >= 10 && y < 30
          ? background + 110
          : background;
      });

      flattenBackground(image);

      expect(levelAt(image, 5, 5)).toBeGreaterThan(240);
      expect(levelAt(image, 62, 20)).toBeLessThan(60);
    });
  });

  describe("When the page is dark only because of a strong shadow", () => {
    it("Then its dark text is not mistaken for light text and the ink stays dark", () => {
      // Sombra muy fuerte, de 230 a 70, con tinta oscura (más oscura que el
      // papel que la rodea) en la zona sombreada.
      const image = buildImage(80, 40, (x, y) => {
        const paper = 230 - (160 * x) / 79;
        return x >= 60 && x < 64 && y >= 10 && y < 30 ? paper * 0.25 : paper;
      });

      flattenBackground(image);

      expect(levelAt(image, 5, 5)).toBeGreaterThan(240);
      expect(levelAt(image, 75, 5)).toBeGreaterThan(240);
      expect(levelAt(image, 62, 20)).toBeLessThan(60);
    });
  });

  describe("When the image is a uniform colour with no text", () => {
    it("Then it does not invert it and stays white", () => {
      const image = buildImage(30, 30, () => 120);

      flattenBackground(image);

      expect(levelAt(image, 15, 15)).toBeGreaterThan(240);
    });
  });

  describe("When the image has no size", () => {
    it("Then it does nothing", () => {
      const image: PixelImage = {
        data: new Uint8ClampedArray(0),
        width: 0,
        height: 0,
      };

      expect(() => flattenBackground(image)).not.toThrow();
    });
  });
});
