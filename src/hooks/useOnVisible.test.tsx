import { render } from "@testing-library/react";
import { useOnVisible } from "./useOnVisible";

type ObserverCallback = (entries: { isIntersecting: boolean }[]) => void;

let callback: ObserverCallback | undefined;
const disconnect = vi.fn();

const Probe = ({ onVisible }: { onVisible: () => void }) => {
  const ref = useOnVisible(onVisible);
  return <div ref={ref} />;
};

describe("Given an element watched for visibility", () => {
  beforeEach(() => {
    callback = undefined;
    disconnect.mockClear();
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(cb: ObserverCallback) {
          callback = cb;
        }
        observe = vi.fn();
        disconnect = disconnect;
      },
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  describe("When it enters the screen", () => {
    it("Then the callback runs, and not when it leaves", () => {
      const onVisible = vi.fn();
      render(<Probe onVisible={onVisible} />);

      callback?.([{ isIntersecting: false }]);
      expect(onVisible).not.toHaveBeenCalled();

      callback?.([{ isIntersecting: true }]);
      expect(onVisible).toHaveBeenCalledTimes(1);
    });
  });

  describe("When the component unmounts", () => {
    it("Then the observer is disconnected", () => {
      const { unmount } = render(<Probe onVisible={vi.fn()} />);

      unmount();

      expect(disconnect).toHaveBeenCalled();
    });
  });

  describe("When IntersectionObserver does not exist", () => {
    it("Then it renders without failing", () => {
      vi.stubGlobal("IntersectionObserver", undefined);

      expect(() => render(<Probe onVisible={vi.fn()} />)).not.toThrow();
    });
  });
});
