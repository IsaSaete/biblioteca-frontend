import type { BookFormat } from "../dto/BookFormat";
import type { BookProvenance } from "../dto/BookProvenance";

export const formatLabels: Record<BookFormat, string> = {
  hardcover: "Tapa dura",
  paperback: "Tapa blanda",
  pocket: "Bolsillo",
};

export const provenanceLabels: Record<BookProvenance, string> = {
  bought: "Comprado",
  gift: "Regalo",
  borrowed: "Prestado",
  inherited: "Heredado",
};

export const isFormat = (value: string): value is BookFormat =>
  value in formatLabels;

export const isProvenance = (value: string): value is BookProvenance =>
  value in provenanceLabels;
