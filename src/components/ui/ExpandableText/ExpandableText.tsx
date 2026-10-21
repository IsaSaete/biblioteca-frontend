import { useId, useLayoutEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "../Button/Button";

interface ExpandableTextProps {
  text: string;
  // Líneas visibles mientras está plegado.
  lines?: number;
}

// Texto largo plegado a unas pocas líneas, con «Ver más» / «Ver menos». El
// botón solo aparece si el texto no cabe: se mide el desbordamiento real en vez
// de contar caracteres, que depende del ancho y de la tipografía.
const ExpandableText = ({ text, lines = 5 }: ExpandableTextProps) => {
  const id = useId();
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useLayoutEffect(() => {
    const element = textRef.current;

    if (element && !isExpanded) {
      setIsOverflowing(element.scrollHeight > element.clientHeight + 1);
    }
  }, [text, lines, isExpanded]);

  return (
    <Box>
      <Typography
        id={id}
        ref={textRef}
        sx={{
          fontSize: "1rem",
          whiteSpace: "pre-line",
          overflowWrap: "anywhere",
          ...(!isExpanded && {
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: lines,
            overflow: "hidden",
          }),
        }}
      >
        {text}
      </Typography>
      {(isOverflowing || isExpanded) && (
        <Button
          variant="text"
          aria-expanded={isExpanded}
          aria-controls={id}
          onClick={() => setIsExpanded((expanded) => !expanded)}
          // Más estrecho en vertical (también su fondo al pasar el ratón), con
          // el área táctil de 44px intacta: la zona extra es invisible.
          sx={{
            minHeight: 32,
            mt: 2,
            py: 0,
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              inset: "-6px 0",
            },
          }}
        >
          {isExpanded ? "Ver menos" : "Ver más"}
        </Button>
      )}
    </Box>
  );
};

export default ExpandableText;
