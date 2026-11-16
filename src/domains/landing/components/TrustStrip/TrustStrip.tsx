import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { trustContent } from "../../content/landingContent";
import { SECTION_PADDING } from "../../layout";

// Tres garantías a la vista justo bajo la portada: la privacidad y la
// exportación son diferenciales y no deben esperar a la sección de datos. En
// móvil cada una va en su línea; en escritorio, en una fila con un punto medio.
const TrustStrip = () => (
  <Box
    component="ul"
    aria-label={trustContent.label}
    sx={{
      listStyle: "none",
      m: 0,
      p: 0,
      pb: SECTION_PADDING,
      display: "flex",
      flexDirection: { xs: "column", md: "row" },
      flexWrap: "wrap",
      alignItems: { xs: "flex-start", md: "center" },
      gap: { xs: 1, md: 3 },
    }}
  >
    {trustContent.points.map((point, index) => (
      <Box
        key={point}
        component="li"
        sx={{ display: "flex", alignItems: "center", gap: 3 }}
      >
        {index > 0 && (
          <Box
            component="span"
            aria-hidden="true"
            sx={{
              display: { xs: "none", md: "inline" },
              color: "text.secondary",
            }}
          >
            ·
          </Box>
        )}
        <Typography
          variant="landingUi"
          sx={{ fontWeight: 400, color: "text.secondary" }}
        >
          {point}
        </Typography>
      </Box>
    ))}
  </Box>
);

export default TrustStrip;
