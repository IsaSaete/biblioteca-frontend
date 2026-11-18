import { useEffect } from "react";
import { useRouteError } from "react-router";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Button from "../../components/ui/Button/Button";
import Logo from "../../components/ui/Logo/Logo";
import { legalContact } from "../../domains/legal/content/legalContact";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { isChunkLoadError } from "../../utils/isChunkLoadError";

// Pantalla de error inesperado: recoge cualquier fallo al pintar una pantalla o
// al descargarla (la raíz del enrutado la usa como `errorElement`). Sin ella, la
// persona vería una pantalla en blanco o la página técnica por defecto. Nunca
// enseña el detalle del error: está en la consola, y es lo que recogerá la
// herramienta de seguimiento de errores cuando la haya.
const ErrorPage = () => {
  const error = useRouteError();
  const isOutdated = isChunkLoadError(error);
  const title = isOutdated
    ? "Hay una versión nueva de Glosa"
    : "Algo ha ido mal";
  useDocumentTitle(title);

  useEffect(() => {
    // Es lo único que queda del error (la pantalla no lo enseña) y lo que
    // recogerá la herramienta de seguimiento de errores: no se puede omitir.
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        px: 4,
        py: 8,
      }}
    >
      <Box component="header">
        <Logo />
      </Box>
      <Box
        component="main"
        sx={{
          flex: 1,
          maxWidth: 480,
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          gap: 2,
        }}
      >
        <Typography variant="h6" component="h1">
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          {isOutdated
            ? "Glosa se ha actualizado mientras la usabas. Recarga la página para continuar."
            : "Ha ocurrido un error inesperado. Recarga la página para volver a intentarlo."}
        </Typography>
        <Box sx={{ display: "grid", gap: 2, width: "100%", maxWidth: 280 }}>
          <Button fullWidth onClick={() => window.location.reload()}>
            Recargar la página
          </Button>
          {/* Un enlace normal y no del enrutado: si el error viene de él, el
              enrutado no es de fiar. */}
          <Button
            variant="text"
            fullWidth
            onClick={() => window.location.assign("/")}
          >
            Volver al inicio
          </Button>
        </Box>
        <Typography color="text.secondary" sx={{ mt: 6, fontSize: "0.875rem" }}>
          Si el problema continúa, escríbenos a{" "}
          <Link href={`mailto:${legalContact.email}`}>
            {legalContact.email}
          </Link>
          .
        </Typography>
      </Box>
    </Box>
  );
};

export default ErrorPage;
