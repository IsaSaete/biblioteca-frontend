import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "../../../../components/ui/Button/Button";
import {
  cropCanvas,
  DEFAULT_CROP,
  moveCorner,
  moveEdge,
  moveRect,
} from "../../ocr/cropRect";
import type { CropCorner, CropEdge, CropRect } from "../../ocr/cropRect";

interface ImageCropperProps {
  image: HTMLCanvasElement;
  // Zona recortada y ya reducida para el OCR. Es transitoria: no se guarda.
  onConfirm: (image: HTMLCanvasElement) => void;
  onRetake: () => void;
}

const KEY_STEP = 0.02;
// Zona táctil de cada agarre: 44 px, el mínimo cómodo para un dedo.
const HIT_SIZE = 44;
const GRIP_SIZE = 18;

type DragTarget =
  | { kind: "edge"; edge: CropEdge }
  | { kind: "corner"; corner: CropCorner }
  | { kind: "body" };

// El recuadro y el punto donde empezó el arrastre: todo se calcula respecto a
// ellos, así el agarre conserva su distancia al dedo y no salta bajo él.
interface Drag {
  target: DragTarget;
  startRect: CropRect;
  startX: number;
  startY: number;
}

const EDGES: Record<CropEdge, { label: string; isHorizontal: boolean }> = {
  top: { label: "Borde superior", isHorizontal: true },
  bottom: { label: "Borde inferior", isHorizontal: true },
  left: { label: "Borde izquierdo", isHorizontal: false },
  right: { label: "Borde derecho", isHorizontal: false },
};

const CORNERS: CropCorner[] = [
  "topLeft",
  "topRight",
  "bottomLeft",
  "bottomRight",
];

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

const getCornerPoint = (rect: CropRect, corner: CropCorner) => ({
  x: corner.endsWith("Left") ? rect.x : rect.x + rect.width,
  y: corner.startsWith("top") ? rect.y : rect.y + rect.height,
});

const applyDrag = (drag: Drag, x: number, y: number): CropRect => {
  const dx = x - drag.startX;
  const dy = y - drag.startY;
  const { startRect, target } = drag;

  switch (target.kind) {
    case "body":
      return moveRect(startRect, dx, dy);
    case "corner": {
      const start = getCornerPoint(startRect, target.corner);
      return moveCorner(startRect, target.corner, start.x + dx, start.y + dy);
    }
    case "edge":
      return moveEdge(
        startRect,
        target.edge,
        getPosition(startRect, target.edge) +
          (EDGES[target.edge].isHorizontal ? dy : dx),
      );
  }
};

// Posición del dedo en proporciones de 0 a 1 de la foto. Todos los agarres son
// hijos directos de la zona de la foto, que es la referencia.
const toPhotoPoint = (event: PointerEvent<HTMLElement>) => {
  const area = event.currentTarget.parentElement?.getBoundingClientRect();

  return area && area.width > 0 && area.height > 0
    ? {
        x: (event.clientX - area.left) / area.width,
        y: (event.clientY - area.top) / area.height,
      }
    : null;
};

// Teclas que mueven cada borde, en la dirección en la que se ve moverse.
const KEY_DIRECTION: Record<string, number> = {
  ArrowUp: -1,
  ArrowLeft: -1,
  ArrowDown: 1,
  ArrowRight: 1,
};

// Recorte de la foto antes de leerla (HU-24): el OCR falla sobre todo en los
// bordes de la página, así que la usuaria deja solo el texto de la cita. Se
// ajusta arrastrando un borde, una esquina o todo el recuadro; con teclado, los
// bordes se mueven con las flechas.
const ImageCropper = ({ image, onConfirm, onRetake }: ImageCropperProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [rect, setRect] = useState<CropRect>(DEFAULT_CROP);

  useEffect(() => {
    canvasRef.current?.getContext("2d")?.drawImage(image, 0, 0);
  }, [image]);

  const dragProps = (target: DragTarget) => ({
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      const point = toPhotoPoint(event);

      if (!point) {
        return;
      }

      event.currentTarget.setPointerCapture(event.pointerId);
      setDrag({
        target,
        startRect: rect,
        startX: point.x,
        startY: point.y,
      });
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      const point = toPhotoPoint(event);

      if (
        !point ||
        !drag ||
        !event.currentTarget.hasPointerCapture(event.pointerId)
      ) {
        return;
      }

      setRect(applyDrag(drag, point.x, point.y));
    },
    onPointerUp: () => setDrag(null),
    onPointerCancel: () => setDrag(null),
  });

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
    setRect((current) =>
      moveEdge(
        current,
        edge,
        getPosition(current, edge) + direction * KEY_STEP,
      ),
    );
  };

  const renderEdge = (edge: CropEdge) => {
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
        {...dragProps({ kind: "edge", edge })}
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
      >
        {/* Pastilla en el centro del borde: dice que se puede agarrar. */}
        <Box
          aria-hidden="true"
          sx={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: isHorizontal ? 40 : 10,
            height: isHorizontal ? 10 : 40,
            transform: "translate(-50%, -50%)",
            borderRadius: 5,
            bgcolor: "primary.main",
            border: 2,
            borderColor: "common.white",
            boxSizing: "content-box",
            zIndex: 1,
          }}
        />
      </Box>
    );
  };

  const renderCorner = (corner: CropCorner) => {
    const point = getCornerPoint(rect, corner);
    const isLeft = corner.endsWith("Left");
    const isTop = corner.startsWith("top");

    return (
      <Box
        key={corner}
        aria-hidden="true"
        data-testid={`crop-corner-${corner}`}
        {...dragProps({ kind: "corner", corner })}
        sx={{
          position: "absolute",
          left: `${point.x * 100}%`,
          top: `${point.y * 100}%`,
          width: HIT_SIZE,
          height: HIT_SIZE,
          ml: `${-HIT_SIZE / 2}px`,
          mt: `${-HIT_SIZE / 2}px`,
          touchAction: "none",
          cursor: isLeft === isTop ? "nwse-resize" : "nesw-resize",
          zIndex: 2,
          "&::after": {
            content: '""',
            position: "absolute",
            left: "50%",
            top: "50%",
            width: GRIP_SIZE,
            height: GRIP_SIZE,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            bgcolor: "primary.main",
            border: 2,
            borderColor: "common.white",
            boxSizing: "content-box",
          },
        }}
      />
    );
  };

  return (
    <Box sx={{ display: "grid", gap: 4 }}>
      {/* El relleno deja sitio para los agarres de los bordes de la foto. */}
      <Box
        sx={{
          p: `${HIT_SIZE / 2}px`,
          width: "100%",
          // El botón «Leer texto» debe verse sin hacer scroll en pantallas bajas.
          maxWidth: `calc(55dvh * ${image.width / image.height} + ${HIT_SIZE}px)`,
          mx: "auto",
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "100%",
            aspectRatio: `${image.width} / ${image.height}`,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
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
            {/* Oscurece lo que quedará fuera del recorte (velo del sistema de
                diseño). */}
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
          </Box>
          {/* Arrastrar el interior mueve el recuadro entero. */}
          <Box
            aria-hidden="true"
            data-testid="crop-body"
            {...dragProps({ kind: "body" })}
            sx={{
              position: "absolute",
              left: `${rect.x * 100}%`,
              top: `${rect.y * 100}%`,
              width: `${rect.width * 100}%`,
              height: `${rect.height * 100}%`,
              touchAction: "none",
              cursor: "move",
            }}
          />
          {(Object.keys(EDGES) as CropEdge[]).map(renderEdge)}
          {CORNERS.map(renderCorner)}
        </Box>
      </Box>

      <Typography
        color="text.secondary"
        sx={{ textAlign: "center", fontSize: "1rem" }}
      >
        Arrastra los bordes o las esquinas para dejar solo el texto de la cita.
        Si arrastras dentro, mueves todo el recuadro.
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
