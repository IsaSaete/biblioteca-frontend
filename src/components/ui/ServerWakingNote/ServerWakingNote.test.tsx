import { act, render, screen } from "@testing-library/react";
import ServerWakingNote, { WAKING_NOTE_DELAY_MS } from "./ServerWakingNote";

describe("Given the server waking note", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("When the request is still pending after the delay", () => {
    it("Then it explains the wait", () => {
      render(<ServerWakingNote isLoading />);

      act(() => {
        vi.advanceTimersByTime(WAKING_NOTE_DELAY_MS);
      });

      expect(screen.getByRole("status")).toHaveTextContent(
        "Estamos despertando el servidor",
      );
    });
  });

  describe("When the request answers before the delay", () => {
    it("Then nothing is shown", () => {
      const { rerender } = render(<ServerWakingNote isLoading />);

      act(() => {
        vi.advanceTimersByTime(WAKING_NOTE_DELAY_MS - 1);
      });
      rerender(<ServerWakingNote isLoading={false} />);
      act(() => {
        vi.advanceTimersByTime(WAKING_NOTE_DELAY_MS);
      });

      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
  });

  describe("When the request is not loading", () => {
    it("Then nothing is shown", () => {
      render(<ServerWakingNote isLoading={false} />);

      act(() => {
        vi.advanceTimersByTime(WAKING_NOTE_DELAY_MS * 2);
      });

      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
  });
});
