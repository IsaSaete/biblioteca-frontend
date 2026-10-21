import type { ReactNode } from "react";
import MuiAccordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";

interface AccordionProps {
  title: string;
  expanded: boolean;
  onChange: (expanded: boolean) => void;
  children: ReactNode;
}

const PencilIcon = () => (
  <svg
    width="20"
    height="20"
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

// Sección desplegable con el icono de lápiz a nivel de bloque (patrón de
// «Más detalles» en Añadir libro). Los hijos siguen montados al plegarse, así
// que sus campos de formulario conservan el valor.
const Accordion = ({ title, expanded, onChange, children }: AccordionProps) => (
  <MuiAccordion
    expanded={expanded}
    onChange={(_event, isExpanded) => onChange(isExpanded)}
    disableGutters
    elevation={0}
    square
    sx={{
      bgcolor: "transparent",
      borderTop: 1,
      borderColor: "divider",
      "&::before": { display: "none" },
    }}
  >
    <AccordionSummary sx={{ minHeight: 44, px: 0 }}>
      <Typography
        component="span"
        sx={{ display: "flex", alignItems: "center", gap: 2, fontWeight: 500 }}
      >
        <PencilIcon />
        {title}
      </Typography>
    </AccordionSummary>
    <AccordionDetails sx={{ px: 0, display: "grid", gap: 5 }}>
      {children}
    </AccordionDetails>
  </MuiAccordion>
);

export default Accordion;
