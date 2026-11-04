import { useLayoutEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import BackButton from "../../../../components/ui/BackButton/BackButton";
import type { LegalContent } from "../../dto/LegalContent";
import { useDocumentTitle } from "../../../../hooks/useDocumentTitle";

interface LegalDocumentProps {
  content: LegalContent;
}

const LegalDocument = ({ content }: LegalDocumentProps) => {
  // Se llega desde el pie de la landing: sin esto el documento se abre con el
  // scroll de la página anterior, al final.
  useDocumentTitle(content.title);

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
        {content.title}
      </Typography>
      <Typography variant="caption" color="text.secondary" component="p">
        Última actualización: {content.lastUpdated}
      </Typography>

      {content.sections.map((section) => (
        <Box component="section" key={section.heading} sx={{ mt: 6 }}>
          <Typography
            variant="subtitle1"
            component="h2"
            sx={{ fontWeight: 500 }}
          >
            {section.heading}
          </Typography>
          {section.paragraphs.map((paragraph) => (
            <Typography key={paragraph} sx={{ mt: 2 }}>
              {paragraph}
            </Typography>
          ))}
          {section.items && (
            <Box component="ul" sx={{ mt: 2, mb: 0, pl: 5 }}>
              {section.items.map((item) => (
                <Typography component="li" key={item} sx={{ mt: 1 }}>
                  {item}
                </Typography>
              ))}
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default LegalDocument;
