import { Link as RouterLink } from "react-router";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import InlineError from "../../../../components/ui/InlineError/InlineError";
import { useGetStatsQuery } from "../../homeApi";

const STAT_LABELS = [
  { key: "books", label: "Libros" },
  { key: "quotes", label: "Citas" },
  { key: "favorites", label: "Favoritos" },
] as const;

// Tres cifras al final de Inicio (HU-35). Solo «Favoritos» es pulsable (D-026):
// lleva a Biblioteca filtrada por favorito, y solo si hay alguno. Libros y
// Citas ya tienen su pestaña en la navegación.
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
            position: "relative",
            "&:focus-within": {
              outline: "2px solid",
              outlineColor: "primary.main",
              outlineOffset: 2,
            },
          }}
        >
          <Typography component="dt" color="text.secondary" variant="caption">
            {key === "favorites" && data && data.favorites > 0 ? (
              <Link
                component={RouterLink}
                to="/library?favorite=true"
                underline="none"
                color="inherit"
                sx={{
                  outline: "none",
                  // La zona pulsable es toda la tarjeta.
                  "&::after": { content: '""', position: "absolute", inset: 0 },
                }}
              >
                {label}
              </Link>
            ) : (
              label
            )}
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
