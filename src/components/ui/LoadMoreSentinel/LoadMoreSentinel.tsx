import Box from "@mui/material/Box";
import { useOnVisible } from "../../../hooks/useOnVisible";

interface LoadMoreSentinelProps {
  onVisible: () => void;
}

// Elemento invisible al final de una lista con scroll infinito: al entrar en
// pantalla pide la siguiente tanda. Ocupa toda la fila de la cuadrícula.
const LoadMoreSentinel = ({ onVisible }: LoadMoreSentinelProps) => {
  const ref = useOnVisible(onVisible);

  return (
    <Box
      component="li"
      ref={ref}
      aria-hidden="true"
      sx={{ gridColumn: "1 / -1", height: 1 }}
    />
  );
};

export default LoadMoreSentinel;
