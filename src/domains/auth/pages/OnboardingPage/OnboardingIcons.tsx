import type { ReactNode } from "react";

interface OnboardingIconProps {
  children: ReactNode;
}

const OnboardingIcon = ({ children }: OnboardingIconProps) => (
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

export const BarcodeIcon = () => (
  <OnboardingIcon>
    <path d="M4 5v14M8 5v14M12 5v14M16 5v14M20 5v14" />
  </OnboardingIcon>
);

export const CameraIcon = () => (
  <OnboardingIcon>
    <path d="M4 8a2 2 0 0 1 2-2h2l1.5-2h5L16 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
    <circle cx="12" cy="13" r="3.5" />
  </OnboardingIcon>
);

export const TagIcon = () => (
  <OnboardingIcon>
    <path d="M3 12V4h8l10 10-8 8z" />
    <circle cx="7.5" cy="8.5" r="1" />
  </OnboardingIcon>
);
