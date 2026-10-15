export interface PasswordRequirement {
  id: string;
  label: string;
  isMet: (password: string) => boolean;
}

// Requisitos de pantallas-y-flujos.md («Contraseña segura»).
export const passwordRequirements: PasswordRequirement[] = [
  {
    id: "length",
    label: "Mínimo 8 caracteres",
    isMet: (password) => password.length >= 8,
  },
  {
    id: "uppercase",
    label: "Una mayúscula",
    isMet: (password) => /[A-Z]/.test(password),
  },
  {
    id: "number",
    label: "Un número",
    isMet: (password) => /[0-9]/.test(password),
  },
  {
    id: "symbol",
    label: "Un símbolo",
    isMet: (password) => /[^A-Za-z0-9]/.test(password),
  },
];

export const isPasswordValid = (password: string): boolean =>
  passwordRequirements.every((requirement) => requirement.isMet(password));
