import type { ReactNode } from "react";

interface NavIconProps {
  children: ReactNode;
}

const NavIcon = ({ children }: NavIconProps) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const HomeIcon = () => (
  <NavIcon>
    <path d="M3 11l9-8 9 8" />
    <path d="M5 10v10h14V10" />
    <path d="M10 20v-6h4v6" />
  </NavIcon>
);

export const LibraryIcon = () => (
  <NavIcon>
    <path d="M4 19.5V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
    <path d="M4 19.5A2 2 0 0 0 6 21.5h13" />
  </NavIcon>
);

export const ProfileIcon = () => (
  <NavIcon>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </NavIcon>
);

export const QuotesIcon = () => (
  <NavIcon>
    <path d="M4 18v-5a6 6 0 0 1 6-6" />
    <path d="M14 18v-5a6 6 0 0 1 6-6" />
    <path d="M4 18h6v-5H4z" />
    <path d="M14 18h6v-5h-6z" />
  </NavIcon>
);
