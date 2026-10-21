import { renderHook, waitFor } from "@testing-library/react";
import { useHasCamera } from "./useHasCamera";

const stubMediaDevices = (value: unknown) =>
  Object.defineProperty(navigator, "mediaDevices", {
    value,
    configurable: true,
  });

afterEach(() => stubMediaDevices(undefined));

describe("Given the camera availability check", () => {
  describe("When the browser has no media devices API", () => {
    it("Then there is no camera", () => {
      stubMediaDevices(undefined);

      const { result } = renderHook(() => useHasCamera());

      expect(result.current).toBe(false);
    });
  });

  describe("When the browser lists a video input", () => {
    it("Then there is a camera", async () => {
      stubMediaDevices({
        getUserMedia: vi.fn(),
        enumerateDevices: vi
          .fn()
          .mockResolvedValue([{ kind: "audioinput" }, { kind: "videoinput" }]),
      });

      const { result } = renderHook(() => useHasCamera());

      await waitFor(() => expect(result.current).toBe(true));
    });
  });

  describe("When the browser only lists audio devices", () => {
    it("Then there is no camera", async () => {
      const enumerateDevices = vi
        .fn()
        .mockResolvedValue([{ kind: "audioinput" }]);
      stubMediaDevices({ getUserMedia: vi.fn(), enumerateDevices });

      const { result } = renderHook(() => useHasCamera());

      await waitFor(() => expect(enumerateDevices).toHaveBeenCalled());
      expect(result.current).toBe(false);
    });
  });

  describe("When listing the devices fails", () => {
    it("Then there is no camera and nothing throws", async () => {
      const enumerateDevices = vi.fn().mockRejectedValue(new Error("fail"));
      stubMediaDevices({ getUserMedia: vi.fn(), enumerateDevices });

      const { result } = renderHook(() => useHasCamera());

      await waitFor(() => expect(enumerateDevices).toHaveBeenCalled());
      expect(result.current).toBe(false);
    });
  });
});
