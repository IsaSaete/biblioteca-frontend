import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "../../../../components/ui/Button/Button";
import type { Loan } from "../../dto/Ejemplar";
import { capitalizeName } from "../../utils/capitalizeFirst";
import LoanDialog from "../LoanDialog/LoanDialog";

interface LoanSectionProps {
  loan?: Loan;
  isPending: boolean;
  hasFailed: boolean;
  // Devuelven `true` si el servidor aceptó el cambio.
  onSave: (borrowerName: string) => Promise<boolean>;
  onReturn: () => Promise<boolean>;
}

const formatLentAt = (lentAt: string): string =>
  new Date(lentAt).toLocaleDateString("es", { dateStyle: "long" });

// Préstamo en la ficha (D-049): sin prestar, «Prestar este libro»; prestado,
// «Prestado a… · desde…» con «Cambiar nombre» y «Ya me lo devolvió».
const LoanSection = ({
  loan,
  isPending,
  hasFailed,
  onSave,
  onReturn,
}: LoanSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async (borrowerName: string) => {
    if (await onSave(borrowerName)) {
      setIsEditing(false);
    }
  };

  return (
    <Box sx={{ textAlign: "center" }}>
      {loan ? (
        <>
          <Typography>
            Prestado a <strong>{capitalizeName(loan.borrowerName)}</strong>
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ fontSize: "0.875rem", mb: 1 }}
          >
            Desde el {formatLentAt(loan.lentAt)}
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <Button
              variant="text"
              disabled={isPending}
              onClick={() => setIsEditing(true)}
            >
              Cambiar nombre
            </Button>
            <Button
              variant="text"
              disabled={isPending}
              onClick={() => void onReturn()}
            >
              Ya me lo devolvió
            </Button>
          </Box>
        </>
      ) : (
        <Button variant="text" onClick={() => setIsEditing(true)}>
          Prestar este libro
        </Button>
      )}
      <LoanDialog
        open={isEditing}
        title={loan ? "Cambiar nombre" : "Prestar este libro"}
        initialName={loan?.borrowerName}
        isPending={isPending}
        hasFailed={hasFailed}
        onSave={(borrowerName) => void handleSave(borrowerName)}
        onCancel={() => setIsEditing(false)}
      />
    </Box>
  );
};

export default LoanSection;
