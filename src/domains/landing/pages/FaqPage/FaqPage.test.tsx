import { screen } from "@testing-library/react";
import { renderRoutes } from "../../../../test/renderRoutes";
import { faqContent } from "../../content/faqContent";
import FaqPage from "./FaqPage";

const routes = [
  { path: "/", element: <p>Landing</p> },
  { path: "/faq", element: <FaqPage /> },
];

describe("Given the frequently asked questions page", () => {
  describe("When it opens", () => {
    it("Then it shows the heading, the tab title and every question", () => {
      renderRoutes(routes, ["/faq"]);

      expect(
        screen.getByRole("heading", { level: 1, name: "Preguntas frecuentes" }),
      ).toBeInTheDocument();
      expect(document.title).toBe("Preguntas frecuentes — Glosa");
      faqContent.items.forEach(({ question }) =>
        expect(screen.getByText(question)).toBeInTheDocument(),
      );
    });

    it("Then every answer starts collapsed", () => {
      renderRoutes(routes, ["/faq"]);

      const details = document.querySelectorAll("details");
      expect(details).toHaveLength(faqContent.items.length);
      details.forEach((item) => expect(item).not.toHaveAttribute("open"));
    });
  });

  describe("When the user opens a question", () => {
    it("Then its answer is visible", async () => {
      const { user } = renderRoutes(routes, ["/faq"]);
      const { question, answer } = faqContent.items[0];

      await user.click(screen.getByText(question));

      expect(screen.getByText(answer).closest("details")).toHaveAttribute(
        "open",
      );
    });
  });
});
