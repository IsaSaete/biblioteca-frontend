import { useState } from "react";
import type { TouchEvent } from "react";
import { Navigate, useNavigate } from "react-router";
import Box from "@mui/material/Box";
import { keyframes } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Button from "../../../../components/ui/Button/Button";
import FullScreenModal from "../../../../components/ui/FullScreenModal/FullScreenModal";
import { useCompleteOnboardingMutation, useMeQuery } from "../../authApi";
import { onboardingSteps } from "./onboardingSteps";
import { visuallyHidden } from "../../../../utils/visuallyHidden";

const titleId = "onboarding-title";
const SWIPE_THRESHOLD_PX = 50;

// El paso entra desde el lado hacia el que se avanza (`--shift` lleva el signo).
const enter = keyframes`
  from { opacity: 0; transform: translateX(var(--shift)); }
  to { opacity: 1; transform: translateX(0); }
`;

// Tour de 3 pasos, siempre saltable. Completarlo o saltarlo lleva al mismo
// sitio y cuenta igual: se marca como visto una sola vez por cuenta (D-016).
const OnboardingPage = () => {
  const navigate = useNavigate();
  const { data } = useMeQuery();
  const [completeOnboarding] = useCompleteOnboardingMutation();
  const [stepIndex, setStepIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);

  if (data?.user.onboardingCompleted === true) {
    return <Navigate to="/home" replace />;
  }

  const lastIndex = onboardingSteps.length - 1;
  const isLastStep = stepIndex === lastIndex;
  const { title, description, Illustration } = onboardingSteps[stepIndex];
  const name = data?.user.name;
  const greeting = name
    ? `Te damos la bienvenida, ${name}`
    : "Te damos la bienvenida";

  const goToStep = (index: number) => {
    const next = Math.min(Math.max(index, 0), lastIndex);
    setDirection(next >= stepIndex ? 1 : -1);
    setStepIndex(next);
  };

  const finish = () => {
    void completeOnboarding();
    void navigate("/home", { replace: true });
  };

  const handleTouchEnd = (event: TouchEvent) => {
    if (touchStartX === null) {
      return;
    }

    const delta = event.changedTouches[0].clientX - touchStartX;
    setTouchStartX(null);

    if (delta <= -SWIPE_THRESHOLD_PX) {
      goToStep(stepIndex + 1);
    } else if (delta >= SWIPE_THRESHOLD_PX) {
      goToStep(stepIndex - 1);
    }
  };

  return (
    <FullScreenModal titleId={titleId}>
      <Box component="h1" id={titleId} sx={visuallyHidden}>
        Bienvenido a Glosa
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button variant="text" onClick={finish}>
          Saltar
        </Button>
      </Box>

      <Box
        aria-live="polite"
        onTouchStart={(event) => setTouchStartX(event.touches[0].clientX)}
        onTouchEnd={handleTouchEnd}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          textAlign: "center",
          py: 4,
          minHeight: 340,
          // El paso entra desplazado: sin recorte, ese desborde saca una barra
          // de scroll horizontal un instante y el diálogo crece y se encoge.
          overflow: "hidden",
          // Móvil en horizontal: se compacta para que quepa sin desplazarse.
          "@media (max-height: 480px)": { py: 2, minHeight: 0 },
        }}
      >
        <Typography
          color="text.secondary"
          sx={{ visibility: stepIndex === 0 ? "visible" : "hidden" }}
        >
          {greeting}
        </Typography>
        <Box
          key={stepIndex}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            "--shift": `${direction * 24}px`,
            animation: `${enter} 240ms ease-out`,
            "@media (prefers-reduced-motion: reduce)": { animation: "none" },
          }}
        >
          <Box
            sx={{
              width: 120,
              height: 120,
              "@media (max-height: 480px)": { width: 72, height: 72 },
            }}
          >
            <Illustration />
          </Box>
          <Typography variant="h6" component="h2">
            {title}
          </Typography>
          <Typography color="text.secondary">{description}</Typography>
        </Box>
        <Box component="span" sx={visuallyHidden}>
          Paso {stepIndex + 1} de {onboardingSteps.length}
        </Box>
      </Box>

      <Box
        aria-hidden="true"
        sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 6 }}
      >
        {onboardingSteps.map((step, index) => (
          <Box
            key={step.id}
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: index === stepIndex ? "primary.main" : "divider",
            }}
          />
        ))}
      </Box>

      <Box sx={{ display: "grid", gap: 2 }}>
        <Button
          fullWidth
          onClick={isLastStep ? finish : () => goToStep(stepIndex + 1)}
        >
          {isLastStep ? "Empezar" : "Siguiente"}
        </Button>
        {/* Siempre ocupa su sitio: así el diálogo no cambia de alto entre pasos. */}
        <Button
          variant="text"
          fullWidth
          onClick={() => goToStep(stepIndex - 1)}
          sx={{ visibility: stepIndex > 0 ? "visible" : "hidden" }}
        >
          Atrás
        </Button>
      </Box>
    </FullScreenModal>
  );
};

export default OnboardingPage;
