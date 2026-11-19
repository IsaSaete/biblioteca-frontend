import { useState } from "react";
import Box from "@mui/material/Box";
import { COVER_SHADOW } from "../../../../theme/coverShadow";
import { coverImageUrl, isGoogleNotAvailable } from "../../utils/coverImageUrl";

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
// Si esa medida falla, o es el «image not available» de Google, se prueba con
// la URL original; y sin `coverUrl`, o si también falla o es otro «image not
// available» (p. ej. la CSP o un enlace roto), se muestra el marcapáginas de
// Glosa: no hay portada. Nunca se enseña el «image not available» de Google.
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
  const markAsFailed = (url: string) =>
    setFailedUrls((urls) => (urls.includes(url) ? urls : [...urls, url]));

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
          onError={() => markAsFailed(imageUrl)}
          onLoad={(event) => {
            const { naturalWidth, naturalHeight } = event.currentTarget;
            const isEnlarged =
              imageUrl === enlargedUrl && enlargedUrl !== coverUrl;

            if (isGoogleNotAvailable(naturalWidth, naturalHeight, isEnlarged)) {
              markAsFailed(imageUrl);
            }
          }}
          sx={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <svg
          viewBox="152 126 208 260"
          fill="currentColor"
          aria-hidden="true"
          data-testid="cover-placeholder"
          style={{ width: "26%", height: "auto" }}
        >
          <polygon points="152,126 360,126 360,386 256,334 152,386" />
        </svg>
      )}
    </Box>
  );
};

export default BookCover;
