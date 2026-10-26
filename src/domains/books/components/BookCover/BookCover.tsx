import { useState } from "react";
import Box from "@mui/material/Box";
import { COVER_SHADOW } from "../../../../theme/coverShadow";

interface BookCoverProps {
  title: string;
  coverUrl?: string;
  // Las miniaturas (listas, buscadores) llevan una sombra más corta.
  size?: "regular" | "small";
}

// Portada 2:3 desde la URL del proveedor (nunca se descarga ni se guarda). Sin
// `coverUrl`, o si la imagen falla (p. ej. la CSP o un enlace roto), se muestra
// un marcador en su lugar.
const BookCover = ({ title, coverUrl, size = "regular" }: BookCoverProps) => {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const hasImage = coverUrl !== undefined && coverUrl !== failedUrl;

  return (
    <Box
      sx={(theme) => ({
        width: "100%",
        aspectRatio: "2 / 3",
        borderRadius: 1.5,
        overflow: "hidden",
        bgcolor: "secondary.main",
        color: "secondary.contrastText",
        display: "grid",
        placeItems: "center",
        boxShadow: COVER_SHADOW.light[size],
        ...theme.applyStyles("dark", { boxShadow: COVER_SHADOW.dark }),
      })}
    >
      {hasImage ? (
        <Box
          component="img"
          src={coverUrl}
          alt={`Portada de ${title}`}
          loading="lazy"
          onError={() => setFailedUrl(coverUrl)}
          sx={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
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
          data-testid="cover-placeholder"
        >
          <path d="M4 19.5V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
          <path d="M4 19.5A2 2 0 0 0 6 21.5h13" />
        </svg>
      )}
    </Box>
  );
};

export default BookCover;
