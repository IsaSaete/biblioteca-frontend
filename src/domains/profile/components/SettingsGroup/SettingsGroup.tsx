import { useId } from "react";
import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface SettingsGroupProps {
  title: string;
  children: ReactNode;
}

const SettingsGroup = ({ title, children }: SettingsGroupProps) => {
  const titleId = useId();

  return (
    <Box component="section" aria-labelledby={titleId}>
      <Typography
        id={titleId}
        component="h2"
        variant="caption"
        color="text.secondary"
        sx={{ px: 2, display: "block" }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
};

export default SettingsGroup;
