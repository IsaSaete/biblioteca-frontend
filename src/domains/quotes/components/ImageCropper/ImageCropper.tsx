import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "../../../../components/ui/Button/Button";
import { cropCanvas, DEFAULT_CROP, moveEdge } from "../../ocr/cropRect";
import type { CropEdge, CropRect } from "../../ocr/cropRect";

interface ImageCropperProps {
  image: HTMLCanvasElement;
  // Zona recortada y ya reducida para el OCR. Es transitoria: no se guarda.
  onConfirm: (image: HTMLCanvasElement) => void;
  onRetake: () => void;
}

const KEY_STEP = 0.02;
// Zona táctil del borde: cómoda para el dedo aunque la línea sea fina.
const HIT_SIZE = 32;

const EDGES: Record<CropEdge, { label: string; isHorizontal: boolean }> = {
  top: { label: "Borde superior", isHorizontal: true },
  bottom: { label: "Borde inferior", isHorizontal: true },
  left: { label: "Borde izquierdo", isHorizontal: false },
  right: { label: "Borde derecho", isHorizontal: false },
};

const getPosition = (rect: CropRect, edge: CropEdge): number => {
  switch (edge) {
    case "top":
      return rect.y;
    case "bottom":
      return rect.y + rect.height;
    case "left":
      return rect.x;
    case "right":
      return rect.x + rect.width;
  }
};

// Teclas que mueven cada borde, en la dirección en la que se ve moverse.
const KEY_DIRECTION: Record<string, number> = {
  ArrowUp: -1,
  ArrowLeft: -1,
  ArrowDown: 1,
  ArrowRight: 1,
};

// Recorte de la foto antes de leerla (HU-24): el OCR falla sobre todo en los
// bordes de la página, así que la usuaria deja solo el texto de la cita. Cada
// borde se arrastra con el dedo o se mueve con las flechas del teclado.
const ImageCropper = ({ image, onConfirm, onRetake }: ImageCropperProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<CropRect>(DEFAULT_CROP);

  useEffect(() => {
    canvasRef.current?.getContext("2d")?.drawImage(image, 0, 0);
  }, [image]);

  const moveTo = (edge: CropEdge, position: number) =>
    setRect((current) => moveEdge(current, edge, position));

  const handlePointerMove = (
    event: PointerEvent<HTMLDivElement>,
    edge: CropEdge,
  ) => {
    const area = areaRef.current?.getBoundingClientRect();

    if (!area || !event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }

    moveTo(
      edge,
      EDGES[edge].isHorizontal
        ? (event.clientY - area.top) / area.height
        : (event.clientX - area.left) / area.width,
    );
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    edge: CropEdge,
  ) => {
    const direction = KEY_DIRECTION[event.key];
    const isAlongEdgeAxis = EDGES[edge].isHorizontal
      ? event.key === "ArrowUp" || event.key === "ArrowDown"
      : event.key === "ArrowLeft" || event.key === "ArrowRight";

    if (direction === undefined || !isAlongEdgeAxis) {
      return;
    }

    event.preventDefault();
    moveTo(edge, getPosition(rect, edge) + direction * KEY_STEP);
  };

  const renderHandle = (edge: CropEdge) => {
    const { label, isHorizontal } = EDGES[edge];
    const position = getPosition(rect, edge);

    return (
      <Box
        key={edge}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-orientation={isHorizontal ? "vertical" : "horizontal"}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position * 100)}
        aria-valuetext={`${Math.round(position * 100)} %`}
        onPointerDown={(event) =>
          event.currentTarget.setPointerCapture(event.pointerId)
        }
        onPointerMove={(event) => handlePointerMove(event, edge)}
        onKeyDown={(event) => handleKeyDown(event, edge)}
        sx={{
          position: "absolute",
          touchAction: "none",
          cursor: isHorizontal ? "ns-resize" : "ew-resize",
          ...(isHorizontal
            ? {
                left: `${rect.x * 100}%`,
                width: `${rect.width * 100}%`,
                top: `${position * 100}%`,
                height: HIT_SIZE,
                mt: `${-HIT_SIZE / 2}px`,
              }
            : {
                top: `${rect.y * 100}%`,
                height: `${rect.height * 100}%`,
                left: `${position * 100}%`,
                width: HIT_SIZE,
                ml: `${-HIT_SIZE / 2}px`,
              }),
          "&:focus-visible": {
            outline: "2px solid",
            outlineColor: "common.white",
          },
          // La línea visible del borde, centrada en su zona táctil.
          "&::after": {
            content: '""',
            position: "absolute",
            bgcolor: "primary.main",
            ...(isHorizontal
              ? { left: 0, right: 0, top: "50%", height: 3, mt: "-1.5px" }
              : { top: 0, bottom: 0, left: "50%", width: 3, ml: "-1.5px" }),
          },
        }}
      />
    );
  };

  return (
    <Box sx={{ display: "grid", gap: 4 }}>
      <Box
        ref={areaRef}
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: `${image.width} / ${image.height}`,
          // El botón «Leer texto» debe verse sin hacer scroll en pantallas bajas.
          maxWidth: `calc(55dvh * ${image.width / image.height})`,
          mx: "auto",
          overflow: "hidden",
          borderRadius: 1.5,
          bgcolor: "common.black",
        }}
      >
        <Box
          component="canvas"
          ref={canvasRef}
          width={image.width}
          height={image.height}
          role="img"
          aria-label="Foto capturada"
          sx={{ display: "block", width: "100%", height: "100%" }}
        />
        {/* Oscurece lo que quedará fuera del recorte (velo del sistema de diseño). */}
        <Box
          aria-hidden="true"
          sx={{
            position: "absolute",
            left: `${rect.x * 100}%`,
            top: `${rect.y * 100}%`,
            width: `${rect.width * 100}%`,
            height: `${rect.height * 100}%`,
            boxShadow: "0 0 0 100vmax rgba(0, 0, 0, 0.4)",
            pointerEvents: "none",
          }}
        />
        {(Object.keys(EDGES) as CropEdge[]).map(renderHandle)}
      </Box>

      <Typography
        color="text.secondary"
        sx={{ textAlign: "center", fontSize: "1rem" }}
      >
        Ajusta los bordes para dejar solo el texto de la cita.
      </Typography>

      <Box sx={{ display: "grid", gap: 3 }}>
        <Button fullWidth onClick={() => onConfirm(cropCanvas(image, rect))}>
          Leer texto
        </Button>
        <Button variant="text" fullWidth onClick={onRetake}>
          Repetir foto
        </Button>
      </Box>
    </Box>
  );
};

export default ImageCropper;
