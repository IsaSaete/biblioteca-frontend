import type { ComponentType } from "react";
import { HomeIcon, LibraryIcon, ProfileIcon, QuotesIcon } from "./NavIcons";

export interface NavItem {
  id: string;
  label: string;
  to: string;
  Icon: ComponentType;
}

// Solo las secciones que ya existen: el botón marcapáginas central ("Añadir
// libro") se incorpora cuando esté construido, para no mostrar nunca una
// función sin implementar.
export const mainNavItems: NavItem[] = [
  { id: "home", label: "Inicio", to: "/home", Icon: HomeIcon },
  { id: "library", label: "Biblioteca", to: "/library", Icon: LibraryIcon },
  { id: "quotes", label: "Citas", to: "/quotes", Icon: QuotesIcon },
  { id: "profile", label: "Perfil", to: "/profile", Icon: ProfileIcon },
];
