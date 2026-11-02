import { act, render, screen } from "@testing-library/react";
import { useInView } from "./useInView";

type Callback = (entries: { isIntersecting: boolean }[]) => void;

let callback: Callback = () => undefined;

class FakeObserver {
  constructor(cb: Callback) {
    callback = cb;
  }
  observe = vi.fn();
  disconnect = vi.fn();
}

const Probe = ({ initial }: { initial: boolean }) => {
  const { ref, inView } = useInView<HTMLDivElement>(initial);

  return <div ref={ref}>{inView ? "se ve" : "no se ve"}</div>;
};

describe("Given an element whose visibility is tracked", () => {
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", FakeObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("When it has not been measured yet", () => {
    it("Then the initial value is assumed", () => {
      render(<Probe initial />);

      expect(screen.getByText("se ve")).toBeInTheDocument();
    });
  });

  describe("When it leaves the screen and comes back", () => {
    it("Then it follows each change", () => {
      render(<Probe initial />);

      act(() => callback([{ isIntersecting: false }]));
      expect(screen.getByText("no se ve")).toBeInTheDocument();

      act(() => callback([{ isIntersecting: true }]));
      expect(screen.getByText("se ve")).toBeInTheDocument();
    });
  });
});
