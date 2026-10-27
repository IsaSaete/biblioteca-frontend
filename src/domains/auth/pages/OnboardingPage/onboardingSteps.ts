import type { ComponentType } from "react";
import {
  CatalogIllustration,
  QuotesIllustration,
  TagsIllustration,
} from "./OnboardingIllustrations";

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  Illustration: ComponentType;
}

// Contenido de pantallas-y-flujos.md («Onboarding»): el paso de las citas con
// cámara, el diferenciador del producto, va en segundo lugar a propósito.
export const onboardingSteps: OnboardingStep[] = [
  {
    id: "catalog",
    title: "Cataloga tus libros en segundos",
    description:
      "Escanea el código de barras o escribe el ISBN y Glosa rellena los datos por ti.",
    Illustration: CatalogIllustration,
  },
  {
    id: "quotes",
    title: "Guarda tus citas con la cámara",
    description:
      "Fotografía un párrafo y Glosa lo convierte en texto. La foto no sale de tu dispositivo.",
    Illustration: QuotesIllustration,
  },
  {
    id: "tags",
    title: "Organiza a tu manera",
    description:
      "Crea tus propias etiquetas y encuentra cualquier libro o cita al instante.",
    Illustration: TagsIllustration,
  },
];
