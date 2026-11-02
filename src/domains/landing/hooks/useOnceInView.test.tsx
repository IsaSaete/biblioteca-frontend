import { act, render, screen } from "@testing-library/react";
import { useOnceInView } from "./useOnceInView";

type Callback = (entries: { isIntersecting: boolean }[]) => void;

let callback: Callback = () => undefined;
const disconnect = vi.fn();

class FakeObserver {
  constructor(cb: Callback) {
    callback = cb;
  }
  observe = vi.fn();
  disconnect = disconnect;
}

const Probe = () => {
  const { ref, seen } = useOnceInView<HTMLDivElement>();

  return <div ref={ref}>{seen ? "visto" : "sin ver"}</div>;
};

describe("Given an element that reports when it enters the screen", () => {
  beforeEach(() => {
    disconnect.mockClear();
    vi.stubGlobal("IntersectionObserver", FakeObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("When it is out of the screen", () => {
    it("Then it is not marked as seen", () => {
      render(<Probe />);

      act(() => callback([{ isIntersecting: false }]));

      expect(screen.getByText("sin ver")).toBeInTheDocument();
    });
  });

  describe("When it enters the screen", () => {
    it("Then it is marked as seen and stops being observed", () => {
      render(<Probe />);

      act(() => callback([{ isIntersecting: true }]));

      expect(screen.getByText("visto")).toBeInTheDocument();
      expect(disconnect).toHaveBeenCalled();
    });
  });

  describe("When the browser cannot observe elements", () => {
    it("Then it is marked as seen right away", () => {
      vi.stubGlobal("IntersectionObserver", undefined);
      delete (window as { IntersectionObserver?: unknown })
        .IntersectionObserver;

      render(<Probe />);

      expect(screen.getByText("visto")).toBeInTheDocument();
    });
  });
});
