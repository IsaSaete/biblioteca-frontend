import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import LoadingRow from "../LoadingRow/LoadingRow";
import HorizontalCarousel from "../../../../components/ui/HorizontalCarousel/HorizontalCarousel";
import InlineError from "../../../../components/ui/InlineError/InlineError";
import NoQuotesCard from "../../../quotes/components/NoQuotesCard/NoQuotesCard";
import QuoteCard from "../../../quotes/components/QuoteCard/QuoteCard";
import { useGetQuotesQuery } from "../../../quotes/quotesApi";
import SectionHeader from "../SectionHeader/SectionHeader";

const TITLE = "Últimas citas";
const MAX_QUOTES = 8;
const SKELETON_COUNT = 2;
// Tarjeta ancha para que una cita siga siendo legible: ≈ 85 % en móvil y
// 340px (entre 320 y 360) desde tablet, con la siguiente asomando.
const QUOTE_WIDTH = { xs: "85%", sm: 340 };

// Las citas más recientes (HU-34), de cualquier libro o sin libro.
const LatestQuotesSection = () => {
  const { data, isLoading, isError, refetch } = useGetQuotesQuery();

  const renderContent = () => {
    if (isLoading) {
      return (
        <Box role="status" aria-label="Cargando tus últimas citas">
          <LoadingRow itemWidth={QUOTE_WIDTH}>
            {Array.from({ length: SKELETON_COUNT }, (_, index) => (
              <Box component="li" key={index} aria-hidden="true">
                <Skeleton
                  variant="rounded"
                  sx={{ height: 120, borderRadius: 1.5 }}
                />
              </Box>
            ))}
          </LoadingRow>
        </Box>
      );
    }

    if (isError || !data) {
      return (
        <InlineError
          message="No hemos podido cargar tus últimas citas."
          onRetry={() => void refetch()}
        />
      );
    }

    if (data.items.length === 0) {
      return <NoQuotesCard message="Todavía no has guardado ninguna cita." />;
    }

    return (
      <HorizontalCarousel label={TITLE} itemWidth={QUOTE_WIDTH}>
        {data.items.slice(0, MAX_QUOTES).map((quote) => (
          <Box component="li" key={quote.id} sx={{ display: "flex" }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <QuoteCard quote={quote} />
            </Box>
          </Box>
        ))}
      </HorizontalCarousel>
    );
  };

  return (
    <Box component="section">
      <SectionHeader title={TITLE} seeAllLabel="Ver todas" seeAllTo="/quotes" />
      {renderContent()}
    </Box>
  );
};

export default LatestQuotesSection;
