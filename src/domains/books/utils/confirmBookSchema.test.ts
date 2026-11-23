import { confirmBookSchema } from "./confirmBookSchema";

const validValues = {
  title: "Cien años de soledad",
  authors: "Gabriel García Márquez",
  publisher: "Alfaguara",
  publishedYear: "1967",
  language: "es",
  pageCount: "471",
};

describe("confirmBookSchema", () => {
  describe("Given a language", () => {
    it("When it has up to 20 characters, Then it is valid", () => {
      const result = confirmBookSchema.safeParse({
        ...validValues,
        language: "a".repeat(20),
      });

      expect(result.success).toBe(true);
    });

    it("When it has more than 20 characters, Then it is rejected with a message on the language field", () => {
      const result = confirmBookSchema.safeParse({
        ...validValues,
        language: "a".repeat(21),
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0]).toMatchObject({
        path: ["language"],
        message: "El idioma no puede tener más de 20 caracteres",
      });
    });
  });
});
