import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 3,
      textAlign: "center",
      py: 10,
      px: 4,
    }}
  >
    <Box sx={{ color: "primary.main", display: "flex" }}>{icon}</Box>
    <Typography variant="h6" component="h2">
      {title}
    </Typography>
    {description && (
      <Typography color="text.secondary">{description}</Typography>
    )}
    {action && <Box sx={{ mt: 3 }}>{action}</Box>}
  </Box>
);

export default EmptyState;
