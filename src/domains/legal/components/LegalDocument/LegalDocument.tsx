import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { LegalContent } from "../../dto/LegalContent";

interface LegalDocumentProps {
  content: LegalContent;
}

const LegalDocument = ({ content }: LegalDocumentProps) => (
  <Box
    component="main"
    sx={{ maxWidth: 720, mx: "auto", px: 4, py: 8, minHeight: "100vh" }}
  >
    <Typography variant="h6" component="h1">
      {content.title}
    </Typography>
    <Typography variant="caption" color="text.secondary" component="p">
      Última actualización: {content.lastUpdated}
    </Typography>

    {content.sections.map((section) => (
      <Box component="section" key={section.heading} sx={{ mt: 6 }}>
        <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 500 }}>
          {section.heading}
        </Typography>
        {section.paragraphs.map((paragraph) => (
          <Typography key={paragraph} sx={{ mt: 2 }}>
            {paragraph}
          </Typography>
        ))}
      </Box>
    ))}
  </Box>
);

export default LegalDocument;
