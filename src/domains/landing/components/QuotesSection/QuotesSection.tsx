import Box from "@mui/material/Box";
import { keyframes } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { quotesContent } from "../../content/landingContent";
import { useOnceInView } from "../../hooks/useOnceInView";
import { themeVars } from "../../themeVars";
import LandingSection from "../LandingSection/LandingSection";
import SectionTitle from "../SectionTitle/SectionTitle";

const draw = keyframes`
  from { background-size: 0 2.5px; }
  to { background-size: 100% 2.5px; }
`;
const scan = keyframes`
  0% { top: 6%; opacity: .8; }
  100% { top: 94%; opacity: 0; }
`;

const corners = [
  {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 6,
  },
  {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 6,
  },
  {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 6,
  },
  {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 6,
  },
];

const { page, card } = quotesContent;

// Único movimiento de la landing: el subrayado y el marco de cámara, una vez,
// al entrar la escena en pantalla. Con `prefers-reduced-motion` no se mueve.
const QuotesSection = () => {
  const { ref, seen } = useOnceInView<HTMLDivElement>();

  return (
    <LandingSection note={quotesContent.note} surface>
      <SectionTitle>{quotesContent.title}</SectionTitle>
      {quotesContent.paragraphs.map((text) => (
        <Typography
          key={text}
          variant="landingText"
          component="p"
          sx={{ color: "text.secondary", maxWidth: "33em", "& + &": { mt: 4 } }}
        >
          {text}
        </Typography>
      ))}
      <Box
        ref={ref}
        sx={(theme) => ({
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.25fr) minmax(0, 1fr)",
          gap: 5,
          alignItems: "center",
          mt: 9,
          [theme.breakpoints.down("md")]: {
            gridTemplateColumns: "minmax(0, 1fr)",
          },
        })}
      >
        <Box
          sx={(theme) => ({
            position: "relative",
            bgcolor: "background.default",
            borderRadius: "4px 12px 12px 4px",
            borderLeft: `3px solid ${themeVars(theme).palette.landing.lineStrong}`,
            pt: 5,
            pr: 6,
            pb: 6,
            pl: 7,
            boxShadow: "0 18px 36px -26px rgba(43,38,32,.4)",
          })}
        >
          <Typography
            variant="landingUi"
            component="div"
            aria-hidden="true"
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 3,
              fontWeight: 400,
              color: "text.secondary",
            }}
          >
            <span>{page.book}</span>
            <span>{page.chapter}</span>
          </Typography>
          <Typography
            variant="landingDisplay"
            component="p"
            sx={{ position: "relative", fontSize: "1em", lineHeight: 1.75 }}
          >
            <Box
              component="span"
              sx={(theme) => ({
                backgroundImage: `linear-gradient(${themeVars(theme).palette.primary.main}, ${themeVars(theme).palette.primary.main})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "100% 2.5px",
                backgroundPosition: "0 100%",
                pb: 1,
                boxDecorationBreak: "clone",
                WebkitBoxDecorationBreak: "clone",
                ...(seen && {
                  animation: `${draw} 1.6s ease-out both`,
                  "@media (prefers-reduced-motion: reduce)": {
                    animation: "none",
                  },
                }),
              })}
            >
              {page.highlighted}
            </Box>{" "}
            {page.rest}
            <Box
              aria-hidden="true"
              component="span"
              sx={{
                position: "absolute",
                inset: "-9px -10px",
                pointerEvents: "none",
              }}
            >
              {corners.map((corner, index) => (
                <Box
                  key={index}
                  component="i"
                  sx={(theme) => ({
                    position: "absolute",
                    width: 16,
                    height: 16,
                    border: "0 solid",
                    borderColor: themeVars(theme).palette.primary.main,
                    ...corner,
                  })}
                />
              ))}
              <Box
                component="b"
                sx={(theme) => ({
                  position: "absolute",
                  left: "-6px",
                  right: "-6px",
                  top: "50%",
                  height: 2,
                  opacity: 0,
                  bgcolor: themeVars(theme).palette.primary.main,
                  ...(seen && {
                    animation: `${scan} 1.6s ease-in-out 1 both`,
                    "@media (prefers-reduced-motion: reduce)": {
                      animation: "none",
                    },
                  }),
                })}
              />
            </Box>
          </Typography>
        </Box>
        <Box
          component="figure"
          sx={(theme) => ({
            m: 0,
            px: 4,
            pt: 4,
            pb: 3,
            bgcolor: "background.default",
            border: `1px solid ${themeVars(theme).palette.landing.lineStrong}`,
            borderRadius: "10px",
            transform: "rotate(1.2deg)",
            boxShadow: "0 18px 36px -26px rgba(43,38,32,.45)",
            [theme.breakpoints.down("md")]: { transform: "none" },
          })}
        >
          <Typography
            variant="landingNote"
            component="blockquote"
            sx={{ m: 0, mb: 2, fontSize: "1em", lineHeight: 1.45 }}
          >
            {card.text}
          </Typography>
          <Typography
            variant="landingUi"
            component="figcaption"
            sx={{
              display: "grid",
              gap: 1,
              fontWeight: 400,
              color: "text.secondary",
            }}
          >
            <span>
              {card.author}, <i>{card.book}</i>
            </span>
            <Box
              component="span"
              sx={(theme) => ({
                color: themeVars(theme).palette.landing.sage,
                fontWeight: 700,
              })}
            >
              ✓ {card.saved}
            </Box>
          </Typography>
        </Box>
      </Box>
    </LandingSection>
  );
};

export default QuotesSection;
