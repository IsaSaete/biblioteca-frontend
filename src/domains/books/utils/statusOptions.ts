import type { PillTone } from "../../../components/ui/Pill/Pill";
import type { BookStatus } from "../dto/BookStatus";

// Estados que se pueden elegir. «Abandonado» existe en el modelo pero aún no se
// ofrece en la interfaz.
export const statusOptions: {
  value: BookStatus;
  label: string;
  tone: PillTone;
}[] = [
  { value: "pending", label: "Pendiente", tone: "neutral" },
  { value: "reading", label: "Leyendo", tone: "accent" },
  { value: "read", label: "Leído", tone: "success" },
];

// Todo estado se puede mostrar, también los que aún no se pueden elegir.
export const getStatusPresentation = (
  status: BookStatus,
): { label: string; tone: PillTone } =>
  statusOptions.find((option) => option.value === status) ?? {
    label: "Abandonado",
    tone: "neutral",
  };
