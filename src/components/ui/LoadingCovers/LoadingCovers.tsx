import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

interface LoadingCoversProps {
  count: number;
}

// Portadas de esqueleto para la cuadrícula mientras carga una tanda.
const LoadingCovers = ({ count }: LoadingCoversProps) => (
  <>
    {Array.from({ length: count }, (_, index) => (
      <Box
        component="li"
        key={index}
        sx={{ listStyle: "none" }}
        aria-hidden="true"
      >
        <Skeleton
          variant="rounded"
          sx={{ aspectRatio: "2 / 3", height: "auto", borderRadius: 1.5 }}
        />
      </Box>
    ))}
  </>
);

export default LoadingCovers;
