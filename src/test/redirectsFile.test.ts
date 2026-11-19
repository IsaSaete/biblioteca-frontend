import redirectsFile from "../../public/_redirects?raw";

// Lee `public/_redirects` (reglas de Netlify, en orden) como [{desde, a, estado}].
const readRedirects = () =>
  redirectsFile
    .split("\n")
    .filter((line) => line.trim() !== "" && !line.trimStart().startsWith("#"))
    .map((line) => {
      const [from, to, status] = line.trim().split(/\s+/);
      return { from, to, status };
    });

describe("Given the redirect rules of the site", () => {
  describe("When the old Netlify address is visited", () => {
    it.each(["http", "https"])(
      "Then %s requests are redirected for good to the own domain keeping the path",
      (protocol) => {
        const rule = readRedirects().find(
          (r) => r.from === `${protocol}://glosa-app.netlify.app/*`,
        );

        expect(rule).toEqual({
          from: `${protocol}://glosa-app.netlify.app/*`,
          to: "https://glosaapp.com/:splat",
          // El `!` obliga a redirigir aunque exista un archivo en esa ruta.
          status: "301!",
        });
      },
    );

    it("Then those rules come before the API proxy and the single page fallback", () => {
      const froms = readRedirects().map((r) => r.from);
      const lastRedirect = froms.lastIndexOf("https://glosa-app.netlify.app/*");

      expect(lastRedirect).toBeLessThan(froms.indexOf("/api/*"));
      expect(froms.indexOf("/api/*")).toBeLessThan(froms.indexOf("/*"));
    });
  });

  describe("When any other address is visited", () => {
    it("Then the API stays behind the same-domain proxy and everything else falls back to the app", () => {
      const rules = readRedirects();

      expect(rules.find((r) => r.from === "/api/*")?.status).toBe("200");
      expect(rules.find((r) => r.from === "/*")).toEqual({
        from: "/*",
        to: "/index.html",
        status: "200",
      });
    });
  });
});
