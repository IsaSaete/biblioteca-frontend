import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { themeVars } from "../../themeVars";

interface Step {
  title: string;
  hint: string;
}

interface StepsListProps {
  label: string;
  steps: readonly Step[];
}

// Pasos en orden con el mismo aire que el índice de «Cuatro maneras»: en
// escritorio, el título, una línea de puntos y la pista a la derecha; en móvil,
// el título con su pista debajo.
const StepsList = ({ label, steps }: StepsListProps) => (
  <Box
    component="ol"
    aria-label={label}
    sx={(theme) => ({
      listStyle: "none",
      m: 0,
      mt: 7,
      p: 0,
      display: "grid",
      [theme.breakpoints.up("md")]: { gap: 4 },
    })}
  >
    {steps.map((step) => (
      <Box
        key={step.title}
        component="li"
        sx={(theme) => ({
          display: "grid",
          rowGap: 1,
          py: 3,
          borderTop: `1px solid ${themeVars(theme).palette.landing.line}`,
          [theme.breakpoints.up("md")]: {
            display: "flex",
            alignItems: "baseline",
            gap: 3,
            py: 0,
            borderTop: 0,
          },
        })}
      >
        <Typography
          variant="landingDisplay"
          component="span"
          sx={{ fontSize: "1.2em", lineHeight: 1.3 }}
        >
          {step.title}
        </Typography>
        <Box
          aria-hidden="true"
          sx={(theme) => ({
            display: "none",
            [theme.breakpoints.up("md")]: {
              display: "block",
              flex: "1 1 24px",
              minWidth: 24,
              height: 0,
              borderBottom: `2px dotted ${themeVars(theme).palette.landing.lineStrong}`,
            },
          })}
        />
        <Typography
          variant="landingUi"
          component="span"
          sx={(theme) => ({
            fontWeight: 400,
            color: "text.secondary",
            [theme.breakpoints.up("md")]: {
              textAlign: "right",
              maxWidth: "20em",
            },
          })}
        >
          {step.hint}
        </Typography>
      </Box>
    ))}
  </Box>
);

export default StepsList;
