import { useLayoutEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import BackButton from "../../../../components/ui/BackButton/BackButton";
import { useDocumentTitle } from "../../../../hooks/useDocumentTitle";
import { faqContent } from "../../content/faqContent";

// Acordeón con `<details>`: el teclado y los lectores de pantalla lo
// entienden sin ARIA, y las respuestas empiezan cerradas.
const FaqPage = () => {
  useDocumentTitle(faqContent.title);

  // Se llega desde el pie de la landing, que está al final de la página.
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Box
      component="main"
      sx={{ maxWidth: 720, mx: "auto", px: 4, py: 8, minHeight: "100vh" }}
    >
      <BackButton fallbackTo="/" />
      <Typography variant="h6" component="h1">
        {faqContent.title}
      </Typography>

      <Box sx={{ mt: 6 }}>
        {faqContent.items.map((item) => (
          <Box
            component="details"
            key={item.question}
            sx={{
              borderBottom: 1,
              borderColor: "secondary.main",
              "&[open] summary::after": { transform: "rotate(-135deg)" },
            }}
          >
            <Typography
              component="summary"
              variant="subtitle1"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 3,
                minHeight: 56,
                py: 2,
                fontWeight: 500,
                cursor: "pointer",
                listStyle: "none",
                "&::-webkit-details-marker": { display: "none" },
                "&::after": {
                  content: '""',
                  flex: "none",
                  width: 10,
                  height: 10,
                  borderRight: "2px solid currentColor",
                  borderBottom: "2px solid currentColor",
                  transform: "rotate(45deg)",
                  transition: "transform 150ms",
                  "@media (prefers-reduced-motion: reduce)": {
                    transition: "none",
                  },
                },
              }}
            >
              {item.question}
            </Typography>
            <Typography sx={{ pb: 4 }}>{item.answer}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default FaqPage;
