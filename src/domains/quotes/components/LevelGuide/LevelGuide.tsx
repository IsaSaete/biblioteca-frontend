import Box from "@mui/material/Box";
import type { TiltOffset } from "../../utils/getTiltOffset";

// Hasta dónde se mueve la burbuja: a esta inclinación llega al borde.
const MAX_TILT_DEG = 20;
const RING_SIZE = 72;
const BUBBLE_SIZE = 22;

const toPixels = (degrees: number): number => {
  const clamped = Math.max(-MAX_TILT_DEG, Math.min(MAX_TILT_DEG, degrees));

  return (clamped / MAX_TILT_DEG) * ((RING_SIZE - BUBBLE_SIZE) / 2);
};

// Con el móvil vertical (lo habitual), una línea horizontal que gira al
// inclinar el móvil, como la de la cámara del iPhone, y se pone verde cuando
// queda recta: es el texto torcido lo que más estorba al lector. Con el móvil
// casi plano, mirando hacia abajo, no hay horizonte que enseñar, y se dibuja un
// aro con una burbuja que se desplaza con la inclinación.
const LevelGuide = ({ tilt }: { tilt: TiltOffset }) => {
  const color = tilt.isLevel ? "success.main" : "common.white";

  if (tilt.mode === "upright") {
    return (
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          pointerEvents: "none",
        }}
      >
        {/* Marcas fijas a los lados: con lo que se compara la línea. */}
        {(["left", "right"] as const).map((side) => (
          <Box
            key={side}
            sx={{
              position: "absolute",
              top: "50%",
              [side]: 12,
              width: 24,
              height: 2,
              mt: "-1px",
              bgcolor: "common.white",
              opacity: 0.7,
            }}
          />
        ))}
        <Box
          sx={{
            width: "70%",
            height: 2,
            borderRadius: 1,
            bgcolor: color,
            // La línea gira al revés que el móvil, para quedar siempre
            // horizontal respecto al suelo.
            transform: `rotate(${-tilt.x}deg)`,
            transition: "background-color 150ms",
          }}
        />
      </Box>
    );
  }

  return (
    <Box
      aria-hidden="true"
      sx={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        pointerEvents: "none",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: RING_SIZE,
          height: RING_SIZE,
          borderRadius: "50%",
          border: 2,
          borderColor: color,
          opacity: 0.9,
          // Cruz central, para ver el centro del aro.
          "&::before, &::after": {
            content: '""',
            position: "absolute",
            bgcolor: color,
            opacity: 0.6,
          },
          "&::before": { left: "50%", top: 4, bottom: 4, width: "1px" },
          "&::after": { top: "50%", left: 4, right: 4, height: "1px" },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: BUBBLE_SIZE,
            height: BUBBLE_SIZE,
            borderRadius: "50%",
            bgcolor: color,
            transform: `translate(calc(-50% + ${toPixels(tilt.x)}px), calc(-50% + ${toPixels(tilt.y)}px))`,
            transition: "background-color 150ms",
          }}
        />
      </Box>
    </Box>
  );
};

export default LevelGuide;
