import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { renderRoutes } from "../../../../test/renderRoutes";
import { server } from "../../../../test/server";
import QuoteFormDialog from "./QuoteFormDialog";

const baseUrl = import.meta.env.VITE_API_URL ?? "";
const recognizeText = vi.fn();

vi.mock("../../ocr/recognizeText", () => ({
  recognizeText: (...args: unknown[]) => recognizeText(...args),
}));

const stopTrack = vi.fn();
const getUserMedia = vi.fn();

const stubCamera = () => {
  getUserMedia.mockResolvedValue({ getTracks: () => [{ stop: stopTrack }] });
  Object.defineProperty(navigator, "mediaDevices", {
    value: {
      getUserMedia,
      enumerateDevices: () => Promise.resolve([{ kind: "videoinput" }]),
    },
    configurable: true,
  });
};

const routes = [
  {
    path: "/",
    element: (
      <QuoteFormDialog
        ejemplarId="ejemplar-1"
        bookTitle="1984"
        onClose={() => undefined}
      />
    ),
  },
];

describe("Given the add quote dialog on a device with a camera", () => {
  beforeEach(() => {
    recognizeText.mockReset();
    getUserMedia.mockReset();
    stopTrack.mockReset();
    stubCamera();
    HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(HTMLVideoElement.prototype, "videoWidth", {
      value: 3000,
      configurable: true,
    });
    Object.defineProperty(HTMLVideoElement.prototype, "videoHeight", {
      value: 4000,
      configurable: true,
    });
    HTMLCanvasElement.prototype.getContext = vi
      .fn()
      .mockReturnValue({ drawImage: vi.fn() });
  });
  afterEach(() =>
    Object.defineProperty(navigator, "mediaDevices", {
      value: undefined,
      configurable: true,
    }),
  );

  describe("When the user scans a quote and it is read", () => {
    it("Then the text is shown to review and it is saved as ocr only after confirming", async () => {
      let body: unknown;
      recognizeText.mockResolvedValue("Muchos años después");
      server.use(
        http.post(`${baseUrl}/quotes`, async ({ request }) => {
          body = await request.json();
          return HttpResponse.json({ quote: {} }, { status: 201 });
        }),
      );

      const { user } = renderRoutes(routes, ["/"]);
      await user.click(
        await screen.findByRole("button", { name: "Escanear con la cámara" }),
      );
      await waitFor(() =>
        expect(screen.getByRole("button", { name: "Capturar" })).toBeEnabled(),
      );
      await user.click(screen.getByRole("button", { name: "Capturar" }));

      const text = await screen.findByLabelText("Cita");
      expect(text).toHaveValue("Muchos años después");
      expect(body).toBeUndefined();
      await user.type(text, " corregido");
      await user.click(screen.getByRole("button", { name: "Guardar cita" }));

      await waitFor(() =>
        expect(body).toEqual({
          ejemplarId: "ejemplar-1",
          text: "Muchos años después corregido",
          origin: "ocr",
        }),
      );
      expect(stopTrack).toHaveBeenCalled();
    });
  });

  describe("When the photo is reduced for the reading", () => {
    it("Then the canvas handed to the OCR respects the size limit", async () => {
      recognizeText.mockResolvedValue("Texto");

      const { user } = renderRoutes(routes, ["/"]);
      await user.click(
        await screen.findByRole("button", { name: "Escanear con la cámara" }),
      );
      await waitFor(() =>
        expect(screen.getByRole("button", { name: "Capturar" })).toBeEnabled(),
      );
      await user.click(screen.getByRole("button", { name: "Capturar" }));
      await screen.findByLabelText("Cita");

      const canvas = recognizeText.mock.calls[0]?.[0] as HTMLCanvasElement;
      expect(canvas.width).toBe(1125);
      expect(canvas.height).toBe(1500);
    });
  });

  describe("When no text is found in the photo", () => {
    it("Then it goes back to the camera with a notice", async () => {
      recognizeText.mockResolvedValue("");

      const { user } = renderRoutes(routes, ["/"]);
      await user.click(
        await screen.findByRole("button", { name: "Escanear con la cámara" }),
      );
      await waitFor(() =>
        expect(screen.getByRole("button", { name: "Capturar" })).toBeEnabled(),
      );
      await user.click(screen.getByRole("button", { name: "Capturar" }));

      expect(
        await screen.findByText(/No hemos encontrado texto en la foto/),
      ).toBeInTheDocument();
      expect(
        await screen.findByRole("button", { name: "Capturar" }),
      ).toBeInTheDocument();
    });
  });

  describe("When the reading fails", () => {
    it("Then it offers to try again or write it by hand", async () => {
      recognizeText.mockRejectedValue(new Error("boom"));

      const { user } = renderRoutes(routes, ["/"]);
      await user.click(
        await screen.findByRole("button", { name: "Escanear con la cámara" }),
      );
      await waitFor(() =>
        expect(screen.getByRole("button", { name: "Capturar" })).toBeEnabled(),
      );
      await user.click(screen.getByRole("button", { name: "Capturar" }));

      expect(
        await screen.findByText(/No se pudo leer el texto/),
      ).toBeInTheDocument();
    });
  });

  describe("When the camera permission is denied", () => {
    it("Then it explains it and offers to write the quote by hand", async () => {
      getUserMedia.mockRejectedValue(new DOMException("", "NotAllowedError"));

      const { user } = renderRoutes(routes, ["/"]);
      await user.click(
        await screen.findByRole("button", { name: "Escanear con la cámara" }),
      );

      expect(
        await screen.findByText(/No pudimos acceder a la cámara/),
      ).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Escribir a mano" }));

      expect(await screen.findByLabelText("Cita")).toHaveValue("");
    });
  });
});

describe("Given the add quote dialog on a device without a camera", () => {
  describe("When it opens", () => {
    it("Then it only offers to write the quote", async () => {
      renderRoutes(routes, ["/"]);

      expect(
        await screen.findByRole("button", { name: "Escribir manualmente" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Escanear con la cámara" }),
      ).not.toBeInTheDocument();
    });
  });
});
