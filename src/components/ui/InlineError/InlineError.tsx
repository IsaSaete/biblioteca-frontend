import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "../Button/Button";

interface InlineErrorProps {
  message: string;
  onRetry: () => void;
}

const InlineError = ({ message, onRetry }: InlineErrorProps) => (
  <Box
    role="alert"
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 4,
      textAlign: "center",
      py: 8,
    }}
  >
    <Typography color="text.secondary">{message}</Typography>
    <Button variant="text" onClick={onRetry}>
      Reintentar
    </Button>
  </Box>
);

export default InlineError;
