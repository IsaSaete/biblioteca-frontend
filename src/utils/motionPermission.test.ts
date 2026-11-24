import { requestMotionPermission } from "./motionPermission";

describe("Given the permission to read the motion of the device", () => {
  afterEach(() => vi.unstubAllGlobals());

  describe("When the browser has no motion events", () => {
    it("Then it is unsupported", async () => {
      vi.stubGlobal("DeviceMotionEvent", undefined);

      expect(await requestMotionPermission()).toBe("unsupported");
    });
  });

  describe("When the browser does not ask for permission (Android)", () => {
    it("Then it is granted without asking", async () => {
      vi.stubGlobal("DeviceMotionEvent", class {});

      expect(await requestMotionPermission()).toBe("granted");
    });
  });

  describe("When the browser asks for permission (iPhone) and the user accepts", () => {
    it("Then it is granted", async () => {
      const requestPermission = vi.fn().mockResolvedValue("granted");
      vi.stubGlobal("DeviceMotionEvent", { requestPermission });

      expect(await requestMotionPermission()).toBe("granted");
      expect(requestPermission).toHaveBeenCalledTimes(1);
    });
  });

  describe("When the user refuses", () => {
    it("Then it is denied", async () => {
      vi.stubGlobal("DeviceMotionEvent", {
        requestPermission: vi.fn().mockResolvedValue("denied"),
      });

      expect(await requestMotionPermission()).toBe("denied");
    });
  });

  describe("When asking for permission fails", () => {
    it("Then it is denied", async () => {
      vi.stubGlobal("DeviceMotionEvent", {
        requestPermission: vi.fn().mockRejectedValue(new Error("no gesture")),
      });

      expect(await requestMotionPermission()).toBe("denied");
    });
  });
});

describe("Given the permission to read the tilt of the device", () => {
  afterEach(() => vi.unstubAllGlobals());

  describe("When the browser has no orientation events", () => {
    it("Then it is unsupported, even if it has motion events", async () => {
      vi.stubGlobal("DeviceOrientationEvent", undefined);
      vi.stubGlobal("DeviceMotionEvent", class {});

      expect(await requestMotionPermission("orientation")).toBe("unsupported");
    });
  });

  describe("When the browser asks for permission for the orientation (iPhone)", () => {
    it("Then it asks that one and not the motion one", async () => {
      const orientation = vi.fn().mockResolvedValue("granted");
      const motion = vi.fn().mockResolvedValue("denied");
      vi.stubGlobal("DeviceOrientationEvent", {
        requestPermission: orientation,
      });
      vi.stubGlobal("DeviceMotionEvent", { requestPermission: motion });

      expect(await requestMotionPermission("orientation")).toBe("granted");
      expect(orientation).toHaveBeenCalledTimes(1);
      expect(motion).not.toHaveBeenCalled();
    });
  });

  describe("When the browser does not ask for permission (Android)", () => {
    it("Then it is granted", async () => {
      vi.stubGlobal("DeviceOrientationEvent", class {});

      expect(await requestMotionPermission("orientation")).toBe("granted");
    });
  });
});
