import headersFile from "../../public/_headers?raw";

// Lee `public/_headers` (reglas de Netlify) como {ruta → cabeceras}.
const readHeaders = (): Map<string, Map<string, string>> => {
  const rules = new Map<string, Map<string, string>>();
  let current: Map<string, string> | undefined;

  for (const line of headersFile.split("\n")) {
    if (line.trim() === "" || line.trimStart().startsWith("#")) {
      continue;
    }

    if (!line.startsWith(" ") && !line.startsWith("\t")) {
      current = new Map();
      rules.set(line.trim(), current);
      continue;
    }

    const separator = line.indexOf(":");
    current?.set(
      line.slice(0, separator).trim().toLowerCase(),
      line.slice(separator + 1).trim(),
    );
  }

  return rules;
};

const ONE_YEAR = 31536000;
const ONE_MONTH = 2592000;

const maxAgeOf = (cacheControl: string | undefined): number | undefined => {
  const match = /max-age=(\d+)/.exec(cacheControl ?? "");

  return match ? Number(match[1]) : undefined;
};

describe("Given the cache rules of the deployment", () => {
  describe("When the hashed files of /assets are served", () => {
    it("Then they are cached for a year as immutable", () => {
      const cache = readHeaders().get("/assets/*")?.get("cache-control");

      expect(cache).toContain("immutable");
      expect(maxAgeOf(cache)).toBe(ONE_YEAR);
    });
  });

  describe("When files with a fixed name are served", () => {
    it.each(["/fonts/*", "/tesseract/*"])(
      "Then %s is cached for at most a month, never as immutable",
      (path) => {
        const cache = readHeaders().get(path)?.get("cache-control");

        expect(maxAgeOf(cache)).toBeGreaterThan(0);
        expect(maxAgeOf(cache)).toBeLessThanOrEqual(ONE_MONTH);
        expect(cache).not.toContain("immutable");
      },
    );
  });

  describe("When the landing is served", () => {
    it("Then the fonts of its first screen are preloaded from the header, only for that page", () => {
      const rules = readHeaders();
      const link = rules.get("/")?.get("link") ?? "";

      for (const font of [
        "besley-normal-500-latin",
        "alegreya-normal-400-700-latin",
        "alegreya-sans-normal-500-latin",
      ]) {
        expect(link).toContain(`</fonts/${font}.woff2>; rel=preload; as=font`);
      }
      // Una fuente precargada necesita `crossorigin`, o el navegador la
      // descarga otra vez al usarla.
      expect(link.match(/crossorigin/g)).toHaveLength(3);
      expect(rules.get("/*")?.has("link") ?? false).toBe(false);
    });
  });

  describe("When any other page is served, such as index.html", () => {
    it("Then no rule caches it, so every deployment reaches everyone", () => {
      const rules = readHeaders();

      expect(rules.get("/*")?.has("cache-control")).toBe(false);
      expect(rules.get("/")?.has("cache-control") ?? false).toBe(false);
      expect(
        [...rules.keys()].filter((path) =>
          rules.get(path)?.has("cache-control"),
        ),
      ).toEqual(["/assets/*", "/fonts/*", "/tesseract/*"]);
    });
  });
});
