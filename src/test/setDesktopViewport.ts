import { vi } from "vitest";

// jsdom no tiene `matchMedia`: con esto, todas las consultas de ancho (por
// ejemplo `useMediaQuery(up("sm"))`) dan el mismo resultado.
export const setDesktopViewport = (isDesktop: boolean) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: isDesktop,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }));
};
