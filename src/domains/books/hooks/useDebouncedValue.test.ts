import { act, renderHook } from "@testing-library/react";
import { useDebouncedValue } from "./useDebouncedValue";

describe("Given a value that changes quickly", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  describe("When it changes before the delay has passed", () => {
    it("Then the debounced value keeps the old one until it settles", () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 400),
        { initialProps: { value: "a" } },
      );

      rerender({ value: "ab" });
      act(() => vi.advanceTimersByTime(399));
      expect(result.current).toBe("a");

      rerender({ value: "abc" });
      act(() => vi.advanceTimersByTime(399));
      expect(result.current).toBe("a");

      act(() => vi.advanceTimersByTime(1));
      expect(result.current).toBe("abc");
    });
  });
});
