import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Typography from "@mui/material/Typography";
import Button from "../../../../components/ui/Button/Button";
import FloatingLabelInput from "../../../../components/ui/FloatingLabelInput/FloatingLabelInput";
import PasswordStrengthChecklist from "../../../../components/ui/PasswordStrengthChecklist/PasswordStrengthChecklist";
import AuthFormHeader from "../../components/AuthFormHeader/AuthFormHeader";
import { useRegisterMutation } from "../../authApi";
import { parseApiError } from "../../utils/parseApiError";
import { registerSchema } from "./registerSchema";
import type { RegisterFormValues } from "./registerSchema";

const formFields = ["name", "email", "password", "acceptedTerms"] as const;

const isFormField = (field: string): field is (typeof formFields)[number] =>
  (formFields as readonly string[]).includes(field);

const RegisterPage = () => {
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register: field,
    control,
    handleSubmit,
    setError,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
    defaultValues: { name: "", email: "", password: "", acceptedTerms: false },
  });

  const password = useWatch({ control, name: "password" });
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // Un campo solo se marca como erróneo si el usuario escribió algo y salió
  // de él, o si ya tenía un error visible y lo está corrigiendo. Los campos
  // vacíos solo se señalan al enviar.
  const validationHandlers = (name: "name" | "email" | "password") => ({
    onBlur: async () => {
      if (getValues(name) !== "") {
        await trigger(name);
      }
    },
    onChange: async () => {
      if (errors[name]) {
        await trigger(name);
      }
    },
  });

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
      apiError?.message ?? "No se pudo crear la cuenta. Inténtalo de nuevo.",
    );
  };

  return (
    <Box
      component="main"
      sx={{ maxWidth: 480, mx: "auto", px: 4, py: 8, minHeight: "100vh" }}
    >
      <Typography
        variant="h2"
        component="p"
        align="center"
        color="primary"
        sx={{ mb: 8 }}
      >
        Glosa
      </Typography>
      <AuthFormHeader title="Bienvenido" subtitle="Regístrate para continuar" />

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
            ...validationHandlers("password"),
            onBlur: async () => {
              setIsPasswordFocused(false);
              if (getValues("password") !== "") {
                await trigger("password");
              }
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
                label="Acepto los Términos y la Política de Privacidad"
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

        <Button type="submit" fullWidth disabled={isLoading}>
          Crear cuenta
        </Button>
      </Box>
    </Box>
  );
};

export default RegisterPage;
