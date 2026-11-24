import { readShakeSetting, writeShakeSetting } from "./shakeSetting";

describe("Given the shake setting of this device", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  describe("When it was never turned on", () => {
    it("Then it is off", () => {
      expect(readShakeSetting()).toBe(false);
    });
  });

  describe("When it is turned on and then off", () => {
    it("Then it is remembered each time", () => {
      writeShakeSetting(true);
      expect(readShakeSetting()).toBe(true);

      writeShakeSetting(false);
      expect(readShakeSetting()).toBe(false);
    });
  });

  describe("When the browser blocks the storage", () => {
    it("Then it does not throw and stays off", () => {
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("blocked");
      });
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("blocked");
      });

      expect(() => writeShakeSetting(true)).not.toThrow();
      expect(readShakeSetting()).toBe(false);
    });
  });
});
