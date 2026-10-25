import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import InlineError from "../../../../components/ui/InlineError/InlineError";
import { useGetStatsQuery } from "../../homeApi";

const STAT_LABELS = [
  { key: "books", label: "Libros" },
  { key: "quotes", label: "Citas" },
  { key: "favorites", label: "Favoritos" },
] as const;

// Tres cifras al final de Inicio (HU-35). No son pulsables: el filtro por
// favorito aún no existe y no se muestra una función sin implementar.
const StatsSection = () => {
  const { data, isLoading, isError, refetch } = useGetStatsQuery();

  if (isError) {
    return (
      <InlineError
        message="No hemos podido cargar tus cifras."
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <Box
      component="dl"
      aria-label="Tus cifras"
      aria-busy={isLoading}
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 3,
        m: 0,
      }}
    >
      {STAT_LABELS.map(({ key, label }) => (
        <Box
          key={key}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            bgcolor: "background.paper",
            borderRadius: 1.5,
            p: 4,
          }}
        >
          <Typography component="dt" color="text.secondary" variant="caption">
            {label}
          </Typography>
          <Typography
            component="dd"
            sx={{ m: 0, order: -1, fontSize: "1.5rem", fontWeight: 500 }}
          >
            {data ? data[key] : <Skeleton sx={{ width: 32 }} />}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default StatsSection;
