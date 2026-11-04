import type { Palette } from "@mui/material/styles";
import theme from "./theme";

const luminance = (hex: string): number => {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (foreground: string, background: string): number => {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort(
    (a, b) => b - a,
  );

  return (lighter + 0.05) / (darker + 0.05);
};

const modes = ["light", "dark"] as const;

// `createTheme` con variables CSS guarda ahí la paleta de cada modo, pero el
// tipo `Theme` no la declara.
interface SchemesTheme {
  colorSchemes: Record<(typeof modes)[number], { palette: Palette }>;
}
const schemes = (theme as unknown as SchemesTheme).colorSchemes;
const spines = [1, 2, 3, 4, 5, 6] as const;

describe("Given the colour tokens of the theme", () => {
  describe.each(modes)("When it is read in %s mode", (mode) => {
    const palette = schemes[mode].palette;

    it("Then the text colours reach 4.5:1 on the page and the surface", () => {
      const backgrounds = [
        palette.background.default,
        palette.background.paper,
      ];

      for (const text of [palette.text.primary, palette.text.secondary]) {
        for (const background of backgrounds) {
          expect(contrast(text, background)).toBeGreaterThanOrEqual(4.5);
        }
      }
    });

    it("Then the text on each book spine of the landing reaches 4.5:1", () => {
      for (const n of spines) {
        const ratio = contrast(
          palette.landing[`onSpine${n}`],
          palette.landing[`spine${n}`],
        );

        expect(ratio, `spine ${n}`).toBeGreaterThanOrEqual(4.5);
      }
    });

    it("Then the text on the button and the dark band reaches 4.5:1", () => {
      expect(
        contrast(palette.primary.contrastText, palette.primary.main),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrast(palette.landing.onBandMuted, palette.landing.band),
      ).toBeGreaterThanOrEqual(4.5);
    });
  });
});
