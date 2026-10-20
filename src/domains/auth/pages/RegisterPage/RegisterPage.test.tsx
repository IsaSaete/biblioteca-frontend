import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "../../../../test/server";
import { renderRoutes } from "../../../../test/renderRoutes";
import RegisterPage from "./RegisterPage";

const registerUrl = `${import.meta.env.VITE_API_URL}/auth/register`;
const validPassword = "Secreta1!";

const renderPage = () =>
  renderRoutes(
    [
      { path: "/register", element: <RegisterPage /> },
      { path: "/onboarding", element: <p>Onboarding</p> },
    ],
    ["/register"],
  ).user;

const fillForm = async (
  user: ReturnType<typeof userEvent.setup>,
  { acceptTerms = true }: { acceptTerms?: boolean } = {},
) => {
  await user.type(screen.getByLabelText("Nombre"), "Isa");
  await user.type(screen.getByLabelText("Email"), "isa@example.com");
  await user.type(screen.getByLabelText("Contraseña"), validPassword);
  if (acceptTerms) {
    await user.click(screen.getByRole("checkbox"));
  }
};

const submit = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole("button", { name: "Crear cuenta" }));

describe("Given the register page", () => {
  describe("When the user focuses an empty field and leaves it", () => {
    it("Then the field is not marked as invalid", async () => {
      const user = renderPage();
      const email = screen.getByLabelText("Email");

      await user.click(email);
      await user.tab();

      expect(email).toBeValid();
    });
  });

  describe("When the user types an invalid email and leaves the field", () => {
    it("Then the field is marked as invalid until it is corrected", async () => {
      const user = renderPage();
      const email = screen.getByLabelText("Email");

      await user.type(email, "isa@");
      await user.tab();
      const invalidAfterBlur = email.getAttribute("aria-invalid");
      await user.type(email, "example.com");

      expect(invalidAfterBlur).toBe("true");
      expect(email).toBeValid();
    });
  });

  describe("When the user has not interacted with the password field", () => {
    it("Then the requirements are not shown", () => {
      renderPage();

      const requirements = screen.queryByRole("list", {
        name: "Requisitos de la contraseña",
      });

      expect(requirements).not.toBeInTheDocument();
    });
  });

  describe("When the user focuses the password field", () => {
    it("Then the requirements are shown", async () => {
      const user = renderPage();

      await user.click(screen.getByLabelText("Contraseña"));

      expect(
        screen.getByRole("list", { name: "Requisitos de la contraseña" }),
      ).toBeInTheDocument();
    });
  });

  describe("When the password meets all the requirements", () => {
    it("Then the list collapses into a single confirmation", async () => {
      const user = renderPage();

      await user.type(screen.getByLabelText("Contraseña"), validPassword);

      expect(screen.getByRole("status")).toHaveTextContent("Contraseña segura");
      expect(
        screen.queryByRole("list", { name: "Requisitos de la contraseña" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("When the user types a password", () => {
    it("Then each requirement is marked as met as soon as it is satisfied", async () => {
      const user = renderPage();

      const password = screen.getByLabelText("Contraseña");
      await user.click(password);
      const pendingBefore = screen.getAllByText("(pendiente)");
      await user.type(password, "Abcdefg1");

      expect(pendingBefore).toHaveLength(4);
      expect(screen.getAllByText("(cumplido)")).toHaveLength(3);
      expect(screen.getAllByText("(pendiente)")).toHaveLength(1);
    });
  });

  describe("When the user toggles the password visibility", () => {
    it("Then the password is shown and hidden", async () => {
      const user = renderPage();
      const input = screen.getByLabelText("Contraseña");

      await user.click(
        screen.getByRole("button", { name: "Mostrar contraseña" }),
      );
      const typeWhenShown = input.getAttribute("type");
      await user.click(
        screen.getByRole("button", { name: "Ocultar contraseña" }),
      );

      expect(typeWhenShown).toBe("text");
      expect(input).toHaveAttribute("type", "password");
    });
  });

  describe("When the user submits without accepting the terms", () => {
    it("Then an error is shown and no request is sent", async () => {
      let requestSent = false;
      server.use(
        http.post(registerUrl, () => {
          requestSent = true;
          return HttpResponse.json({}, { status: 201 });
        }),
      );
      const user = renderPage();
      await fillForm(user, { acceptTerms: false });

      await submit(user);

      expect(
        await screen.findByText(/Debes aceptar los Términos/),
      ).toBeInTheDocument();
      expect(requestSent).toBe(false);
    });
  });

  describe("When the user submits a password that does not meet the requirements", () => {
    it("Then the password field shows an error", async () => {
      const user = renderPage();
      await user.type(screen.getByLabelText("Nombre"), "Isa");
      await user.type(screen.getByLabelText("Email"), "isa@example.com");
      await user.type(screen.getByLabelText("Contraseña"), "abc");
      await user.click(screen.getByRole("checkbox"));

      await submit(user);

      expect(
        await screen.findByText("La contraseña no cumple los requisitos"),
      ).toBeInTheDocument();
    });
  });

  describe("When the user submits valid data and the API creates the account", () => {
    it("Then the data is sent as in the contract and the user goes to the onboarding", async () => {
      let body: unknown;
      server.use(
        http.post(registerUrl, async ({ request }) => {
          body = await request.json();
          return HttpResponse.json(
            { user: { id: "1", name: "Isa", email: "isa@example.com" } },
            { status: 201 },
          );
        }),
      );
      const user = renderPage();
      await fillForm(user);

      await submit(user);

      expect(await screen.findByText("Onboarding")).toBeInTheDocument();
      expect(body).toEqual({
        name: "Isa",
        email: "isa@example.com",
        password: validPassword,
        acceptedTerms: true,
      });
    });
  });

  describe("When the API answers AUTH_EMAIL_TAKEN for the email field", () => {
    it("Then the error is shown on the email field", async () => {
      server.use(
        http.post(registerUrl, () =>
          HttpResponse.json(
            {
              error: {
                code: "AUTH_EMAIL_TAKEN",
                message: "Este email ya está registrado",
                field: "email",
              },
            },
            { status: 400 },
          ),
        ),
      );
      const user = renderPage();
      await fillForm(user);

      await submit(user);

      expect(
        await screen.findByText("Este email ya está registrado"),
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Email")).toBeInvalid();
    });
  });

  describe("When the API fails without a field", () => {
    it("Then a general error is shown", async () => {
      server.use(
        http.post(registerUrl, () =>
          HttpResponse.json({ message: "boom" }, { status: 500 }),
        ),
      );
      const user = renderPage();
      await fillForm(user);

      await submit(user);

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "No se pudo crear la cuenta",
      );
    });
  });
});
