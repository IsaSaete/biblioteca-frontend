import { useState } from "react";
import Box from "@mui/material/Box";
import { COVER_SHADOW } from "../../../../theme/coverShadow";
import { coverImageUrl } from "../../utils/coverImageUrl";

interface BookCoverProps {
  title: string;
  coverUrl?: string;
  // Las miniaturas (listas, buscadores) llevan una sombra más corta.
  size?: "regular" | "small";
  // Dentro de un enlace o botón que ya lleva el título al lado, la portada no
  // aporta nombre: sin `alt` el lector no repite «Portada de…» + el título.
  decorative?: boolean;
  // Las primeras portadas visibles de una pantalla (la más grande suele ser la
  // que mide el LCP) se descargan ya, sin esperar a que el navegador decida.
  priority?: boolean;
}

// Portada 2:3 desde la URL del proveedor (nunca se descarga ni se guarda), en
// una medida mayor que la miniatura por defecto para que no se vea pixelada.
// Si esa medida falla se prueba con la URL original; y sin `coverUrl`, o si
// también falla (p. ej. la CSP o un enlace roto), se muestra un marcador.
const BookCover = ({
  title,
  coverUrl,
  size = "regular",
  decorative = false,
  priority = false,
}: BookCoverProps) => {
  const [failedUrls, setFailedUrls] = useState<string[]>([]);
  const enlargedUrl =
    coverUrl === undefined ? undefined : coverImageUrl(coverUrl);
  const imageUrl = [enlargedUrl, coverUrl].find(
    (url) => url !== undefined && !failedUrls.includes(url),
  );

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
      {imageUrl !== undefined ? (
        <Box
          component="img"
          src={imageUrl}
          alt={decorative ? "" : `Portada de ${title}`}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          onError={() => setFailedUrls((urls) => [...urls, imageUrl])}
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
