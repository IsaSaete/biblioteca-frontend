import Box from "@mui/material/Box";
import Button from "../../../../components/ui/Button/Button";
import type { ConfirmBookVariant } from "./confirmBookVariant";

interface SaveActionsProps {
  submitsTo: ConfirmBookVariant["submitsTo"];
  isCreating: boolean;
  isAdding: boolean;
  // Acceso directo a la lista de deseos desde la confirmación de la biblioteca.
  onSaveToWishlist: () => void;
}

// Los botones de guardar: en la lista de deseos uno solo; en la biblioteca, el
// principal y el acceso directo a la lista de deseos.
const SaveActions = ({
  submitsTo,
  isCreating,
  isAdding,
  onSaveToWishlist,
}: SaveActionsProps) => {
  const isLoading = isCreating || isAdding;

  if (submitsTo === "wishlist") {
    return (
      <Button type="submit" fullWidth disabled={isLoading}>
        {isAdding ? "Añadiendo…" : "Añadir a la lista de deseos"}
      </Button>
    );
  }

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      <Button type="submit" fullWidth disabled={isLoading}>
        {isCreating ? "Añadiendo…" : "Añadir a mi biblioteca"}
      </Button>
      <Button
        variant="neutral"
        fullWidth
        disabled={isLoading}
        onClick={onSaveToWishlist}
      >
        {isAdding ? "Añadiendo…" : "Añadir a la lista de deseos"}
      </Button>
    </Box>
  );
};

export default SaveActions;
