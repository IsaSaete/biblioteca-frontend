import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface AuthFormHeaderProps {
  title: string;
  subtitle: string;
}

const AuthFormHeader = ({ title, subtitle }: AuthFormHeaderProps) => (
  <Box sx={{ textAlign: "center", mb: 6 }}>
    <Typography variant="h6" component="h1">
      {title}
    </Typography>
    <Typography color="text.secondary">{subtitle}</Typography>
  </Box>
);

export default AuthFormHeader;
