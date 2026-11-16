import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { demoBooks } from "../../content/demoLibrary";
import { tagsContent } from "../../content/landingContent";
import {
  countBooks,
  describeSelection,
  matchesSelection,
  NO_DEMO_FILTERS,
} from "../../utils/demoFilters";
import type { DemoSelection } from "../../utils/demoFilters";
import LandingSection from "../LandingSection/LandingSection";
import PhoneMockup from "../PhoneMockup/PhoneMockup";
import SectionTitle from "../SectionTitle/SectionTitle";

// El estado de la demostración es local: no es del servidor ni de la app.
const TagsDemo = () => {
  const [selection, setSelection] = useState<DemoSelection>(NO_DEMO_FILTERS);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  // `false` hasta el primer cambio: así no se anuncia nada al cargar la página.
  const [hasChanged, setHasChanged] = useState(false);
  const shown = demoBooks.filter((book) =>
    matchesSelection(book, selection),
  ).length;

  const changeSelection = (next: DemoSelection) => {
    setSelection(next);
    setHasChanged(true);
  };

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
            {hasChanged
              ? `Mostrando ${describeSelection(selection)}: ${countBooks(shown)}.`
              : ""}
          </Typography>
        </Box>
        <PhoneMockup
          books={demoBooks}
          selection={selection}
          isSheetOpen={isSheetOpen}
          onSelectionChange={changeSelection}
          onSheetOpenChange={setIsSheetOpen}
        />
      </Box>
    </LandingSection>
  );
};

export default TagsDemo;
