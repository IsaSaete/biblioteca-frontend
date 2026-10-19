// Solo para cookies legibles desde JavaScript (csrfToken). Las de sesión son
// httpOnly y el frontend nunca las toca.
export const readCookie = (name: string): string | undefined => {
  const prefix = `${name}=`;
  const entry = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(prefix));

  return entry ? decodeURIComponent(entry.slice(prefix.length)) : undefined;
};
