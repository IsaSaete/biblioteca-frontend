import Typography from "@mui/material/Typography";
import { useIsSlow } from "../../../hooks/useIsSlow";

// Segundos de espera tras los que se explica por qué tarda: con el servidor
// despierto la respuesta llega antes y el aviso no llega a verse.
export const WAKING_NOTE_DELAY_MS = 3000;

interface ServerWakingNoteProps {
  isLoading: boolean;
}

// Aviso bajo el botón de un formulario que espera al servidor. El formulario
// no se sustituye (se perdería lo escrito si el servidor responde con un
// error): solo se añade una línea. El servidor gratuito se duerme y tarda unos
// segundos en volver.
const ServerWakingNote = ({ isLoading }: ServerWakingNoteProps) => {
  const isSlow = useIsSlow(isLoading, WAKING_NOTE_DELAY_MS);

  if (!isSlow) {
    return null;
  }

  return (
    <Typography
      role="status"
      color="text.secondary"
      sx={{ fontSize: "0.875rem", textAlign: "center" }}
    >
      Estamos despertando el servidor. Puede tardar unos segundos la primera
      vez.
    </Typography>
  );
};

export default ServerWakingNote;
