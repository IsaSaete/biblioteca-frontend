import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface AuthFormHeaderProps {
  titleId: string;
  title: string;
  subtitle: string;
}

const AuthFormHeader = ({ titleId, title, subtitle }: AuthFormHeaderProps) => (
  <Box sx={{ textAlign: "center", mb: 6 }}>
    <Typography id={titleId} variant="h6" component="h1">
      {title}
    </Typography>
    <Typography color="text.secondary">{subtitle}</Typography>
  </Box>
);

export default AuthFormHeader;
