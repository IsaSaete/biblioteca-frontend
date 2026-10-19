import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import FullScreenModal from "../../../../components/ui/FullScreenModal/FullScreenModal";
import Logo from "../../../../components/ui/Logo/Logo";
import AuthFormHeader from "../AuthFormHeader/AuthFormHeader";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  footer: ReactNode;
  children: ReactNode;
}

const titleId = "auth-title";

const AuthLayout = ({ title, subtitle, footer, children }: AuthLayoutProps) => (
  <FullScreenModal titleId={titleId}>
    <Box sx={{ mb: 8 }}>
      <Logo />
    </Box>
    <AuthFormHeader titleId={titleId} title={title} subtitle={subtitle} />
    {children}
    <Box sx={{ mt: 6, textAlign: "center" }}>{footer}</Box>
  </FullScreenModal>
);

export default AuthLayout;
