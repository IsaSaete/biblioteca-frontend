import Box from "@mui/material/Box";
import { referenceLineSx } from "./referenceLineSx";

interface BookReferenceProps {
  title: string;
  authors: string[];
}

// El libro de una cita en dos niveles: el autor arriba, con su nombre completo
// (sin invertir: separar el apellido falla con los compuestos), y debajo el
// título en cursiva. Varios autores van separados por comas en la misma línea.
// Aunque falte el autor, su línea se reserva.
const BookReference = ({ title, authors }: BookReferenceProps) => (
  <Box sx={{ minWidth: 0 }}>
    <Box sx={{ ...referenceLineSx, fontWeight: 500 }}>{authors.join(", ")}</Box>
    <Box component="em" sx={{ ...referenceLineSx, display: "block" }}>
      {title}
    </Box>
  </Box>
);

export default BookReference;
