import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link as RouterLink, useNavigate } from "react-router";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Link from "@mui/material/Link";
import Button from "../../../../components/ui/Button/Button";
import ServerWakingNote from "../../../../components/ui/ServerWakingNote/ServerWakingNote";
import FloatingLabelInput from "../../../../components/ui/FloatingLabelInput/FloatingLabelInput";
import PasswordStrengthChecklist from "../../../../components/ui/PasswordStrengthChecklist/PasswordStrengthChecklist";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import { useRegisterMutation } from "../../authApi";
import { useFieldValidation } from "../../hooks/useFieldValidation";
import { getFormErrorMessage } from "../../utils/getFormErrorMessage";
import { parseApiError } from "../../utils/parseApiError";
import { registerSchema } from "./registerSchema";
import type { RegisterFormValues } from "./registerSchema";
import { useDocumentTitle } from "../../../../hooks/useDocumentTitle";

const formFields = ["name", "email", "password", "acceptedTerms"] as const;

const isFormField = (field: string): field is (typeof formFields)[number] =>
  (formFields as readonly string[]).includes(field);

const RegisterPage = () => {
  useDocumentTitle("Crear cuenta");
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
    defaultValues: { name: "", email: "", password: "", acceptedTerms: false },
  });
  const {
    register: field,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = form;
  const validationHandlers = useFieldValidation(form);

  const password = useWatch({ control, name: "password" });

  const onSubmit = async (values: RegisterFormValues) => {
    setFormError(null);
    const result = await register(values);

    if (!result.error) {
      await navigate("/onboarding");
      return;
    }

    const apiError = parseApiError(result.error);

    if (apiError?.field && isFormField(apiError.field)) {
      setError(apiError.field, { message: apiError.message });
      return;
    }

    setFormError(
      getFormErrorMessage(
        result.error,
        "No se pudo crear la cuenta. Inténtalo de nuevo.",
      ),
    );
  };

  const passwordHandlers = validationHandlers("password");

  return (
    <AuthLayout
      onClose={() => void navigate("/", { replace: true })}
      title="Bienvenido"
      subtitle="Regístrate para continuar"
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link component={RouterLink} to="/login">
            Inicia sesión
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
        {formError && <Alert severity="error">{formError}</Alert>}

        <FloatingLabelInput
          label="Nombre"
          autoComplete="given-name"
          error={!!errors.name}
          helperText={errors.name?.message}
          {...field("name", validationHandlers("name"))}
        />
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
          autoComplete="new-password"
          error={!!errors.password}
          helperText={errors.password?.message}
          {...field("password", {
            ...passwordHandlers,
            onBlur: async () => {
              setIsPasswordFocused(false);
              await passwordHandlers.onBlur();
            },
          })}
          onFocus={() => setIsPasswordFocused(true)}
        />
        <PasswordStrengthChecklist
          password={password}
          isVisible={isPasswordFocused || password !== ""}
        />

        <Box>
          <Controller
            name="acceptedTerms"
            control={control}
            render={({ field: { value, onChange, onBlur, ref } }) => (
              <FormControlLabel
                // Los textos se abren en otra pestaña para no perder lo escrito.
                label={
                  <>
                    Acepto los{" "}
                    <Link href="/terms" target="_blank" rel="noopener">
                      Términos
                    </Link>{" "}
                    y la{" "}
                    <Link href="/privacy" target="_blank" rel="noopener">
                      Política de Privacidad
                    </Link>
                  </>
                }
                control={
                  <Checkbox
                    checked={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    slotProps={{ input: { ref } }}
                  />
                }
              />
            )}
          />
          {errors.acceptedTerms && (
            <FormHelperText error>
              {errors.acceptedTerms.message}
            </FormHelperText>
          )}
        </Box>

        <Button
          type="submit"
          fullWidth
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? "Creando cuenta…" : "Crear cuenta"}
        </Button>
        <ServerWakingNote isLoading={isLoading} />
      </Box>
    </AuthLayout>
  );
};

export default RegisterPage;
