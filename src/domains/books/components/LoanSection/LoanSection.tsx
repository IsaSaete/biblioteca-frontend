import { useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Button from "../../../../components/ui/Button/Button";
import type { Loan } from "../../dto/Ejemplar";
import { capitalizeName } from "../../utils/capitalizeFirst";
import { formatLoanDate } from "../../utils/formatLoanDate";
import LoanDialog from "../LoanDialog/LoanDialog";

interface LoanSectionProps {
  loan?: Loan;
  isPending: boolean;
  hasFailed: boolean;
  // Devuelven `true` si el servidor aceptó el cambio.
  onSave: (borrowerName: string) => Promise<boolean>;
  onReturn: () => Promise<boolean>;
}

const PencilIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </svg>
);

// Préstamo en la ficha (D-049). Sin prestar: un botón pequeño de contorno. Prestado: un
// aviso pequeño, como una notificación, con quién lo tiene y desde cuándo, el
// lápiz para corregir el nombre en la esquina y «Ya me lo devolvió».
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
    <Box sx={{ width: "100%", display: "grid", justifyItems: "center" }}>
      {loan ? (
        <Box
          sx={{
            position: "relative",
            width: "100%",
            px: 3,
            pt: 3,
            pb: 2,
            borderRadius: 1.5,
            bgcolor: "background.paper",
            textAlign: "left",
          }}
        >
          <IconButton
            aria-label="Cambiar nombre"
            disabled={isPending}
            onClick={() => setIsEditing(true)}
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 44,
              height: 44,
              color: "text.secondary",
            }}
          >
            <PencilIcon />
          </IconButton>
          <Box sx={{ minWidth: 0, pr: 7 }}>
            <Typography sx={{ fontSize: "0.875rem", overflowWrap: "anywhere" }}>
              Prestado a <strong>{capitalizeName(loan.borrowerName)}</strong>
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: "0.8125rem" }}>
              Desde el {formatLoanDate(loan.lentAt)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              variant="text"
              disabled={isPending}
              onClick={() => void onReturn()}
              // El fondo al pasar el ratón es bajo (32 px) para no pegarse al
              // texto; la zona de toque sigue siendo de 44 px.
              sx={{
                position: "relative",
                minHeight: 32,
                py: 0,
                px: 2,
                fontSize: "0.875rem",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  inset: "-6px 0",
                },
              }}
            >
              Ya me lo devolvió
            </Button>
          </Box>
        </Box>
      ) : (
        <Button
          variant="text"
          aria-haspopup="dialog"
          onClick={() => setIsEditing(true)}
          sx={{
            border: "1px solid",
            borderColor: "primary.main",
            borderRadius: "999px",
            color: "text.primary",
            minHeight: 40,
            px: 4,
            fontSize: "0.875rem",
          }}
        >
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
