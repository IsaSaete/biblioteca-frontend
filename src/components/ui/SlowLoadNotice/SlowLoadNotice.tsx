import Box from "@mui/material/Box";
import { keyframes } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Logo from "../Logo/Logo";

// Cada lomo se levanta un momento y vuelve, uno tras otro, como una ola.
const lift = keyframes`
  0%, 40%, 100% { transform: translateY(0); }
  20% { transform: translateY(-8px); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const accent = "var(--mui-palette-primary-main)";
const soft = "var(--mui-palette-secondary-main)";
const green = "var(--mui-palette-success-main)";
const muted = "var(--mui-palette-text-secondary)";

// Lomos de la estantería: posición, tamaño y color de cada uno.
const books = [
  { x: 20, width: 14, height: 46, fill: accent },
  { x: 36, width: 12, height: 56, fill: soft, stroke: accent },
  { x: 50, width: 16, height: 50, fill: green },
  { x: 68, width: 12, height: 60, fill: muted, opacity: 0.55 },
  { x: 82, width: 14, height: 44, fill: accent, opacity: 0.75 },
];
const SHELF_Y = 80;

// Aviso de espera larga: el nombre, una estantería que se anima y un texto que
// explica por qué tarda (el servidor gratuito se duerme y tarda unos segundos
// en volver).
const SlowLoadNotice = () => (
  <Box
    role="status"
    sx={{
      minHeight: "60vh",
      display: "grid",
      placeContent: "center",
      justifyItems: "center",
      gap: 3,
      p: 4,
      textAlign: "center",
      animation: `${fadeIn} 300ms ease-out`,
      "@media (prefers-reduced-motion: reduce)": { animation: "none" },
    }}
  >
    <Logo />
    <Box
      component="svg"
      viewBox="0 0 116 90"
      width={116}
      height={90}
      fill="none"
      aria-hidden="true"
      sx={{
        "& .book": {
          animation: `${lift} 1.6s ease-in-out infinite`,
          "@media (prefers-reduced-motion: reduce)": { animation: "none" },
        },
      }}
    >
      {books.map(({ x, width, height, fill, stroke, opacity }, index) => (
        <g
          key={x}
          className="book"
          style={{ animationDelay: `${index * 0.15}s` }}
        >
          <rect
            x={x}
            y={SHELF_Y - height}
            width={width}
            height={height}
            rx="2"
            fill={fill}
            stroke={stroke}
            strokeWidth={stroke ? 1.5 : undefined}
            opacity={opacity}
          />
          {/* Marcapáginas asomando por arriba, el de la identidad de Glosa. */}
          {index === 3 && (
            <path
              d={`M${x + 6}${SHELF_Y - height - 6}h5v13l-2.5-2.5-2.5 2.5z`}
              fill={accent}
            />
          )}
        </g>
      ))}
      <path
        d={`M10 ${SHELF_Y + 2}h96`}
        stroke={muted}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </Box>
    <Typography>Estamos despertando el servidor</Typography>
    <Typography color="text.secondary" sx={{ fontSize: "0.875rem" }}>
      Puede tardar unos segundos la primera vez.
    </Typography>
  </Box>
);

export default SlowLoadNotice;
