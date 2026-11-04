import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import type { LegalContent } from "../../dto/LegalContent";
import { privacyContent } from "../../content/privacyContent";
import { termsContent } from "../../content/termsContent";
import { legalContact } from "../../content/legalContact";
import LegalDocument from "./LegalDocument";

const renderDocument = (content: LegalContent) =>
  render(
    <MemoryRouter>
      <LegalDocument content={content} />
    </MemoryRouter>,
  );

describe("Given a legal document", () => {
  describe("When it opens", () => {
    it("Then the page is scrolled to the top", () => {
      const scrollTo = vi.fn();
      vi.stubGlobal("scrollTo", scrollTo);

      renderDocument({
        title: "Documento",
        lastUpdated: "1 de enero",
        sections: [],
      });

      expect(scrollTo).toHaveBeenCalledWith(0, 0);
      vi.unstubAllGlobals();
    });
  });

  describe("When a section has paragraphs and a list", () => {
    it("Then the heading, the paragraphs and the list items are shown", () => {
      renderDocument({
        title: "Documento",
        lastUpdated: "1 de enero",
        sections: [
          {
            heading: "Sección",
            paragraphs: ["Un párrafo."],
            items: ["Primero", "Segundo"],
          },
        ],
      });

      expect(
        screen.getByRole("heading", { level: 1, name: "Documento" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Última actualización: 1 de enero"),
      ).toBeVisible();
      expect(
        screen.getByRole("heading", { level: 2, name: "Sección" }),
      ).toBeInTheDocument();
      expect(screen.getByText("Un párrafo.")).toBeInTheDocument();
      expect(screen.getAllByRole("listitem").map((i) => i.textContent)).toEqual(
        ["Primero", "Segundo"],
      );
    });
  });

  describe("When a section has no list", () => {
    it("Then no list is drawn", () => {
      renderDocument({
        title: "Documento",
        lastUpdated: "1 de enero",
        sections: [{ heading: "Sección", paragraphs: ["Texto."] }],
      });

      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });
  });
});

describe("Given the real privacy policy and terms", () => {
  describe.each([
    ["the privacy policy", privacyContent],
    ["the terms of use", termsContent],
  ])("When %s is shown", (_name, content) => {
    it("Then it has content, a real date and the contact of the owner", () => {
      renderDocument(content);

      expect(content.sections.length).toBeGreaterThan(5);
      expect(content.lastUpdated).not.toBe("pendiente");
      expect(
        screen.getAllByText(new RegExp(legalContact.email)).length,
      ).toBeGreaterThan(0);
    });
  });
});
