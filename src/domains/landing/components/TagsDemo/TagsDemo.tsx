import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { demoBooks, demoFilters } from "../../content/demoLibrary";
import type { DemoFilterId } from "../../content/demoLibrary";
import { tagsContent } from "../../content/landingContent";
import { themeVars } from "../../themeVars";
import { countBooks, matchesFilter } from "../../utils/demoFilters";
import LandingSection from "../LandingSection/LandingSection";
import PhoneMockup from "../PhoneMockup/PhoneMockup";
import SectionTitle from "../SectionTitle/SectionTitle";

// El estado de la demostración es local: no es del servidor ni de la app.
const TagsDemo = () => {
  // `null` hasta el primer toque: así no se anuncia nada al cargar la página.
  const [touched, setTouched] = useState<DemoFilterId | null>(null);
  const filter = touched ?? "todos";
  const shown = demoBooks.filter((book) => matchesFilter(book, filter)).length;
  const announcement = demoFilters.find(
    ({ id }) => id === filter,
  )?.announcement;

  return (
    <LandingSection note={tagsContent.note}>
      <Box
        sx={(theme) => ({
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 292px",
          columnGap: "clamp(24px, 4vw, 48px)",
          rowGap: 5,
          alignItems: "start",
          [theme.breakpoints.down("md")]: {
            gridTemplateColumns: "minmax(0, 1fr)",
            "& > :last-child": { mx: "auto" },
          },
        })}
      >
        <Box>
          <SectionTitle>{tagsContent.title}</SectionTitle>
          <Typography
            variant="landingText"
            component="p"
            sx={{ color: "text.secondary", maxWidth: "33em" }}
          >
            {tagsContent.text}
          </Typography>
          <Box
            role="group"
            aria-label={tagsContent.groupLabel}
            sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 6 }}
          >
            {demoFilters.map(({ id, label }) => {
              const selected = id === filter;

              return (
                <Box
                  key={id}
                  component="button"
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setTouched(id)}
                  sx={(theme) => ({
                    ...theme.typography.landingUi,
                    minHeight: 44,
                    px: 4,
                    cursor: "pointer",
                    borderRadius: "999px",
                    border: `1.5px solid ${selected ? themeVars(theme).palette.primary.main : themeVars(theme).palette.landing.lineStrong}`,
                    bgcolor: selected ? "primary.main" : "transparent",
                    color: selected ? "primary.contrastText" : "text.primary",
                    transition:
                      "background-color 140ms, border-color 140ms, color 140ms",
                    "@media (prefers-reduced-motion: reduce)": {
                      transition: "none",
                    },
                    "&:hover": {
                      borderColor: themeVars(theme).palette.primary.main,
                    },
                  })}
                >
                  {label}
                </Box>
              );
            })}
          </Box>
          <Typography
            variant="landingUi"
            component="p"
            aria-live="polite"
            sx={(theme) => ({
              mt: 4,
              fontWeight: 400,
              color: "text.secondary",
              minHeight: "1.4em",
              // En móvil el recuento ya se ve en la tarjeta: aquí solo se
              // deja para quien usa un lector de pantalla.
              [theme.breakpoints.down("md")]: {
                position: "absolute",
                // En píxeles: en `sx`, `1` significa 100 %.
                width: "1px",
                height: "1px",
                m: 0,
                minHeight: 0,
                overflow: "hidden",
                clip: "rect(0 0 0 0)",
                whiteSpace: "nowrap",
              },
            })}
          >
            {touched === null
              ? ""
              : `Mostrando ${announcement}: ${countBooks(shown)}.`}
          </Typography>
        </Box>
        <PhoneMockup books={demoBooks} filter={filter} />
      </Box>
    </LandingSection>
  );
};

export default TagsDemo;
