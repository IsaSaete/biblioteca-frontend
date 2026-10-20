import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import FullScreenModal from "../../../../components/ui/FullScreenModal/FullScreenModal";
import Logo from "../../../../components/ui/Logo/Logo";
import AuthFormHeader from "../AuthFormHeader/AuthFormHeader";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  footer?: ReactNode;
  onBack?: () => void;
  children: ReactNode;
}

const titleId = "auth-title";

const AuthLayout = ({
  title,
  subtitle,
  footer,
  onBack,
  children,
}: AuthLayoutProps) => (
  <FullScreenModal titleId={titleId} onBack={onBack}>
    <Box sx={{ mb: 5 }}>
      <Logo />
    </Box>
    <AuthFormHeader titleId={titleId} title={title} subtitle={subtitle} />
    {children}
    {footer && <Box sx={{ mt: 6, textAlign: "center" }}>{footer}</Box>}
  </FullScreenModal>
);

export default AuthLayout;
