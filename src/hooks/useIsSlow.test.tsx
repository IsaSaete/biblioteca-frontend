import { act, renderHook } from "@testing-library/react";
import { useIsSlow } from "./useIsSlow";

describe("Given the useIsSlow hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("When the loading lasts longer than the delay", () => {
    it("Then it becomes slow", () => {
      const { result } = renderHook(() => useIsSlow(true, 1500));

      act(() => {
        vi.advanceTimersByTime(1500);
      });

      expect(result.current).toBe(true);
    });
  });

  describe("When the loading ends before the delay", () => {
    it("Then it never becomes slow", () => {
      const { result, rerender } = renderHook(
        ({ isLoading }) => useIsSlow(isLoading, 1500),
        { initialProps: { isLoading: true } },
      );

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      rerender({ isLoading: false });
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current).toBe(false);
    });
  });

  describe("When a slow loading ends", () => {
    it("Then it stops being slow", () => {
      const { result, rerender } = renderHook(
        ({ isLoading }) => useIsSlow(isLoading, 1500),
        { initialProps: { isLoading: true } },
      );
      act(() => {
        vi.advanceTimersByTime(1500);
      });

      rerender({ isLoading: false });

      expect(result.current).toBe(false);
    });
  });
});
