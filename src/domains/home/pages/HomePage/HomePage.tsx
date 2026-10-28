import Box from "@mui/material/Box";
import { visuallyHidden } from "../../../../utils/visuallyHidden";
import LatestQuotesSection from "../../components/LatestQuotesSection/LatestQuotesSection";
import RecentBooksSection from "../../components/RecentBooksSection/RecentBooksSection";
import StatsSection from "../../components/StatsSection/StatsSection";

// Inicio (HU-32, 34 y 35): libros recientes, últimas citas y tres cifras, en
// una sola columna. Cada sección carga y falla por su cuenta.
const HomePage = () => (
  <Box
    component="main"
    sx={{
      maxWidth: 960,
      mx: "auto",
      p: 4,
      pt: 8,
      display: "flex",
      flexDirection: "column",
      gap: 8,
    }}
  >
    <Box component="h1" sx={visuallyHidden}>
      Inicio
    </Box>
    <RecentBooksSection />
    <LatestQuotesSection />
    <StatsSection />
  </Box>
);

export default HomePage;
