import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import FullScreenModal from "../../../../components/ui/FullScreenModal/FullScreenModal";
import Brand from "../../../../components/ui/Brand/Brand";
import AuthFormHeader from "../AuthFormHeader/AuthFormHeader";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  footer?: ReactNode;
  onBack?: () => void;
  // Cierra la pantalla de acceso y vuelve a la portada (✕, Esc o el fondo).
  onClose?: () => void;
  children: ReactNode;
}

const titleId = "auth-title";

const AuthLayout = ({
  title,
  subtitle,
  footer,
  onBack,
  onClose,
  children,
}: AuthLayoutProps) => (
  <FullScreenModal titleId={titleId} onBack={onBack} onClose={onClose}>
    <Box sx={{ display: "flex", justifyContent: "center", mb: 8 }}>
      <Brand to="/" tagline={false} compact accent />
    </Box>
    <AuthFormHeader titleId={titleId} title={title} subtitle={subtitle} />
    {children}
    {footer && <Box sx={{ mt: 6, textAlign: "center" }}>{footer}</Box>}
  </FullScreenModal>
);

export default AuthLayout;
