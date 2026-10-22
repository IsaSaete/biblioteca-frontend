import type { ComponentType } from "react";
import { LibraryIcon, ProfileIcon, QuotesIcon } from "./NavIcons";

export interface NavItem {
  id: string;
  label: string;
  to: string;
  Icon: ComponentType;
}

// Solo las secciones que ya existen: Inicio y el botón marcapáginas
// central ("Añadir libro") se incorporan cuando estén construidos, para no
// mostrar nunca una función sin implementar.
export const mainNavItems: NavItem[] = [
  { id: "library", label: "Biblioteca", to: "/library", Icon: LibraryIcon },
  { id: "quotes", label: "Citas", to: "/quotes", Icon: QuotesIcon },
  { id: "profile", label: "Perfil", to: "/profile", Icon: ProfileIcon },
];
