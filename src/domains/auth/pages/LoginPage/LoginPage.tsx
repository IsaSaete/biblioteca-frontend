import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link as RouterLink, useLocation, useNavigate } from "react-router";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Button from "../../../../components/ui/Button/Button";
import FloatingLabelInput from "../../../../components/ui/FloatingLabelInput/FloatingLabelInput";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import { booksApi } from "../../../books/booksApi";
import { authApi, useLoginMutation } from "../../authApi";
import { useFieldValidation } from "../../hooks/useFieldValidation";
import { getRedirectPath } from "../../utils/getRedirectPath";
import { getFormErrorMessage } from "../../utils/getFormErrorMessage";
import { loginSchema } from "./loginSchema";
import type { LoginFormValues } from "./loginSchema";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    defaultValues: { email: "", password: "" },
  });
  const {
    register: field,
    handleSubmit,
    formState: { errors },
  } = form;
  const validationHandlers = useFieldValidation(form);

  // Llegar al login significa que no hay sesión (se cerró o caducó): se descarta
  // lo que hubiera en caché ligado a ella
  // (también la biblioteca, para que no se vea desde otra cuenta).
  useEffect(() => {
    dispatch(authApi.util.resetApiState());
    dispatch(booksApi.util.resetApiState());
  }, [dispatch]);

  const wasPasswordReset =
    typeof location.state === "object" &&
    location.state !== null &&
    "passwordReset" in location.state &&
    location.state.passwordReset === true;

  const wasAccountDeleted =
    typeof location.state === "object" &&
    location.state !== null &&
    "accountDeleted" in location.state &&
    location.state.accountDeleted === true;

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);
    const result = await login(values);

    if (!result.error) {
      await navigate(getRedirectPath(location.state), { replace: true });
      return;
    }

    // Credenciales incorrectas y exceso de intentos traen su mensaje del
    // backend; el de credenciales es genérico a propósito.
    setFormError(
      getFormErrorMessage(
        result.error,
        "No se pudo iniciar sesión. Inténtalo de nuevo.",
      ),
    );
  };

  return (
    <AuthLayout
      title="Bienvenido"
      subtitle="Inicia sesión para continuar"
      footer={
        <>
          ¿No tienes cuenta?{" "}
          <Link component={RouterLink} to="/register">
            Regístrate
          </Link>
        </>
      }
    >
      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        sx={{ display: "grid", gap: 5 }}
      >
        {wasPasswordReset && (
          <Alert severity="success">
            Contraseña actualizada. Inicia sesión con la nueva.
          </Alert>
        )}
        {wasAccountDeleted && (
          <Alert severity="success">
            Tu cuenta y tus datos se han eliminado.
          </Alert>
        )}
        {formError && <Alert severity="error">{formError}</Alert>}

        <FloatingLabelInput
          label="Email"
          type="email"
          autoComplete="email"
          error={!!errors.email}
          helperText={errors.email?.message}
          {...field("email", validationHandlers("email"))}
        />
        <FloatingLabelInput
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          error={!!errors.password}
          helperText={errors.password?.message}
          {...field("password", validationHandlers("password"))}
        />
        <Box sx={{ textAlign: "right", mt: -3 }}>
          <Link component={RouterLink} to="/forgot-password">
            ¿Olvidaste tu contraseña?
          </Link>
        </Box>

        <Button type="submit" fullWidth disabled={isLoading}>
          Iniciar sesión
        </Button>
      </Box>
    </AuthLayout>
  );
};

export default LoginPage;
