import { Outlet } from "react-router";
import LandingPage from "../../domains/landing/pages/LandingPage/LandingPage";

// Las pantallas de acceso se abren como un diálogo sobre la portada: con la
// landing detrás se puede cerrar y volver a ella. Si el enlace se abre
// directamente, la portada también queda detrás.
const LandingBehindAuth = () => (
  <>
    <LandingPage />
    <Outlet />
  </>
);

export default LandingBehindAuth;
