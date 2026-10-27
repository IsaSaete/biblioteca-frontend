import type { ReactNode } from "react";

interface IllustrationProps {
  children: ReactNode;
}

// Colores de las ilustraciones: salen de la paleta del tema, así que cambian
// solos con el modo claro / oscuro.
const accent = "var(--mui-palette-primary-main)";
const soft = "var(--mui-palette-secondary-main)";
const muted = "var(--mui-palette-text-secondary)";
const surface = "var(--mui-palette-background-default)";

const Illustration = ({ children }: IllustrationProps) => (
  <svg
    viewBox="0 0 120 120"
    width="100%"
    height="100%"
    fill="none"
    aria-hidden="true"
  >
    {children}
  </svg>
);

// Un libro con su código de barras y la línea del escáner cruzándolo.
export const CatalogIllustration = () => (
  <Illustration>
    <rect x="30" y="10" width="60" height="100" rx="6" fill={soft} />
    <path d="M70 10h14v26l-7-6-7 6z" fill={accent} />
    <rect
      x="38"
      y="46"
      width="30"
      height="4"
      rx="2"
      fill={muted}
      opacity="0.6"
    />
    <rect
      x="38"
      y="55"
      width="22"
      height="4"
      rx="2"
      fill={muted}
      opacity="0.4"
    />
    <rect x="38" y="76" width="44" height="26" rx="3" fill={surface} />
    <path
      d="M43 81v16M48 81v16M52 81v16M58 81v16M62 81v16M68 81v16M73 81v16M77 81v16"
      stroke={muted}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path d="M24 89h72" stroke={accent} strokeWidth="3" strokeLinecap="round" />
  </Illustration>
);

// Un párrafo con unas esquinas de cámara enmarcando la línea que se captura.
export const QuotesIllustration = () => (
  <Illustration>
    <rect x="20" y="14" width="80" height="92" rx="8" fill={soft} />
    <rect
      x="30"
      y="28"
      width="44"
      height="5"
      rx="2.5"
      fill={muted}
      opacity="0.5"
    />
    <rect
      x="30"
      y="40"
      width="60"
      height="5"
      rx="2.5"
      fill={muted}
      opacity="0.5"
    />
    <rect x="30" y="52" width="52" height="5" rx="2.5" fill={accent} />
    <rect x="30" y="64" width="60" height="5" rx="2.5" fill={accent} />
    <rect
      x="30"
      y="76"
      width="36"
      height="5"
      rx="2.5"
      fill={muted}
      opacity="0.5"
    />
    <rect
      x="30"
      y="88"
      width="56"
      height="5"
      rx="2.5"
      fill={muted}
      opacity="0.5"
    />
    <path
      d="M24 50v-6a4 4 0 0 1 4-4h6M96 50v-6a4 4 0 0 0-4-4h-6M24 74v6a4 4 0 0 0 4 4h6M96 74v6a4 4 0 0 1-4 4h-6"
      stroke={accent}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Illustration>
);

// Un libro con tres etiquetas de las que el usuario crea.
export const TagsIllustration = () => (
  <Illustration>
    <rect x="30" y="12" width="60" height="96" rx="6" fill={soft} />
    <path d="M70 12h14v26l-7-6-7 6z" fill={accent} />
    <rect
      x="38"
      y="48"
      width="30"
      height="4"
      rx="2"
      fill={muted}
      opacity="0.6"
    />
    <rect x="14" y="62" width="48" height="18" rx="9" fill={accent} />
    <rect x="22" y="69" width="32" height="4" rx="2" fill={surface} />
    <rect
      x="50"
      y="84"
      width="56"
      height="18"
      rx="9"
      fill={surface}
      stroke={accent}
      strokeWidth="2"
    />
    <rect x="60" y="91" width="36" height="4" rx="2" fill={accent} />
    <rect
      x="66"
      y="40"
      width="40"
      height="18"
      rx="9"
      fill={surface}
      stroke={muted}
      strokeWidth="2"
      opacity="0.9"
    />
    <rect x="76" y="47" width="20" height="4" rx="2" fill={muted} />
  </Illustration>
);
